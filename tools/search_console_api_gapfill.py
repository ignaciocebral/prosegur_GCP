#!/usr/bin/env python
"""Refresh Search Console API gap-fill tables for SEO Insights."""

from __future__ import annotations

import argparse
import datetime as dt
import os
import time
from dataclasses import dataclass
from typing import Iterable

import requests
from google.api_core.exceptions import NotFound
from google.auth.transport.requests import Request
from google.cloud import bigquery
from google.oauth2 import service_account


PROJECT_ID = "pga-data-b2b-marketing-dev"
LOCATION = "europe-west1"
DEFAULT_LOOKBACK_DAYS = 10
SEARCH_TYPE_API = "web"
SEARCH_TYPE_BQ = "WEB"
ROW_LIMIT = 25_000


@dataclass(frozen=True)
class CountryConfig:
    country: str
    dataset: str
    site_url: str


COUNTRIES = {
    "mx": CountryConfig("mx", "searchconsole_mx", "sc-domain:grupoprosegur.com.mx"),
    "hn": CountryConfig("hn", "searchconsole_hn", "sc-domain:prosegur.hn"),
    "cr": CountryConfig("cr", "searchconsole_cr", "sc-domain:prosegur.cr"),
    "gt": CountryConfig("gt", "searchconsole_gt", "sc-domain:prosegur.gt"),
}


SITE_SCHEMA = [
    bigquery.SchemaField("data_date", "DATE", mode="REQUIRED"),
    bigquery.SchemaField("site_url", "STRING", mode="REQUIRED"),
    bigquery.SchemaField("query", "STRING"),
    bigquery.SchemaField("is_anonymized_query", "BOOL"),
    bigquery.SchemaField("country", "STRING"),
    bigquery.SchemaField("search_type", "STRING", mode="REQUIRED"),
    bigquery.SchemaField("device", "STRING"),
    bigquery.SchemaField("impressions", "INTEGER"),
    bigquery.SchemaField("clicks", "INTEGER"),
    bigquery.SchemaField("sum_top_position", "FLOAT"),
]


URL_SCHEMA = [
    bigquery.SchemaField("data_date", "DATE", mode="REQUIRED"),
    bigquery.SchemaField("site_url", "STRING", mode="REQUIRED"),
    bigquery.SchemaField("url", "STRING"),
    bigquery.SchemaField("query", "STRING"),
    bigquery.SchemaField("is_anonymized_query", "BOOL"),
    bigquery.SchemaField("is_anonymized_discover", "BOOL"),
    bigquery.SchemaField("country", "STRING"),
    bigquery.SchemaField("search_type", "STRING", mode="REQUIRED"),
    bigquery.SchemaField("device", "STRING"),
    bigquery.SchemaField("impressions", "INTEGER"),
    bigquery.SchemaField("clicks", "INTEGER"),
    bigquery.SchemaField("sum_position", "FLOAT"),
]


def default_end_date() -> dt.date:
    return dt.date.today() - dt.timedelta(days=3)


def parse_args() -> argparse.Namespace:
    end_date = default_end_date()
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project-id", default=PROJECT_ID)
    parser.add_argument("--location", default=LOCATION)
    parser.add_argument(
        "--start-date",
        default=(end_date - dt.timedelta(days=DEFAULT_LOOKBACK_DAYS)).isoformat(),
        help="Defaults to a rolling 10-day refresh window before the Search Console-safe end date.",
    )
    parser.add_argument("--end-date", default=end_date.isoformat())
    parser.add_argument("--countries", default="mx,hn,cr,gt")
    parser.add_argument(
        "--gsc-credentials",
        default=os.environ.get(
            "GA4_SERVICE_ACCOUNT_FILE",
            r"C:\Users\ES00697029\AGENTS\.secure\gcp\ga4-api.json",
        ),
    )
    parser.add_argument(
        "--bq-credentials",
        default=os.environ.get(
            "GOOGLE_APPLICATION_CREDENTIALS",
            r"C:\Users\ES00697029\AGENTS\.secure\gcp\claude-vertex-auth-pga.json",
        ),
    )
    parser.add_argument("--dry-run", action="store_true")
    return parser.parse_args()


def service_account_credentials(path: str, scopes: list[str]) -> service_account.Credentials:
    return service_account.Credentials.from_service_account_file(path, scopes=scopes)


def get_gsc_token(credentials_path: str) -> str:
    credentials = service_account_credentials(credentials_path, ["https://www.googleapis.com/auth/webmasters.readonly"])
    credentials.refresh(Request())
    return credentials.token


def get_bq_client(project_id: str, location: str, credentials_path: str) -> bigquery.Client:
    credentials = service_account_credentials(credentials_path, ["https://www.googleapis.com/auth/cloud-platform"])
    return bigquery.Client(project=project_id, credentials=credentials, location=location)


def ensure_dataset(client: bigquery.Client, project_id: str, dataset_id: str, location: str) -> None:
    dataset_ref = f"{project_id}.{dataset_id}"
    try:
        client.get_dataset(dataset_ref)
    except NotFound:
        dataset = bigquery.Dataset(dataset_ref)
        dataset.location = location
        client.create_dataset(dataset)


def ensure_table(
    client: bigquery.Client,
    project_id: str,
    dataset_id: str,
    table_id: str,
    schema: list[bigquery.SchemaField],
) -> None:
    table_ref = f"{project_id}.{dataset_id}.{table_id}"
    try:
        client.get_table(table_ref)
    except NotFound:
        table = bigquery.Table(table_ref, schema=schema)
        table.time_partitioning = bigquery.TimePartitioning(
            type_=bigquery.TimePartitioningType.DAY,
            field="data_date",
        )
        table.clustering_fields = ["site_url", "search_type", "device"]
        client.create_table(table)


def zero_based_sum_position(api_row: dict) -> float:
    impressions = int(api_row.get("impressions", 0) or 0)
    position = float(api_row.get("position", 0) or 0)
    return max(position - 1, 0) * impressions


def query_search_console(
    token: str,
    site_url: str,
    start_date: str,
    end_date: str,
    dimensions: list[str],
) -> Iterable[dict]:
    endpoint = "https://www.googleapis.com/webmasters/v3/sites/{}/searchAnalytics/query".format(
        requests.utils.quote(site_url, safe="")
    )
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    start_row = 0

    while True:
        body = {
            "startDate": start_date,
            "endDate": end_date,
            "dimensions": dimensions,
            "searchType": SEARCH_TYPE_API,
            "rowLimit": ROW_LIMIT,
            "startRow": start_row,
        }
        response = requests.post(endpoint, headers=headers, json=body, timeout=120)
        if response.status_code >= 400:
            raise RuntimeError(f"Search Console query failed for {site_url}: {response.status_code} {response.text}")

        rows = response.json().get("rows", [])
        yield from rows
        if len(rows) < ROW_LIMIT:
            break
        start_row += ROW_LIMIT
        time.sleep(0.25)


def to_site_row(site_url: str, api_row: dict) -> dict:
    data_date, query, country, device = api_row.get("keys", ["", "", "", ""])
    return {
        "data_date": data_date,
        "site_url": site_url,
        "query": query or "",
        "is_anonymized_query": False,
        "country": country,
        "search_type": SEARCH_TYPE_BQ,
        "device": device,
        "impressions": int(api_row.get("impressions", 0) or 0),
        "clicks": int(api_row.get("clicks", 0) or 0),
        "sum_top_position": zero_based_sum_position(api_row),
    }


def to_url_row(site_url: str, api_row: dict) -> dict:
    data_date, url, query, country, device = api_row.get("keys", ["", "", "", "", ""])
    return {
        "data_date": data_date,
        "site_url": site_url,
        "url": url or "",
        "query": query or "",
        "is_anonymized_query": False,
        "is_anonymized_discover": False,
        "country": country,
        "search_type": SEARCH_TYPE_BQ,
        "device": device,
        "impressions": int(api_row.get("impressions", 0) or 0),
        "clicks": int(api_row.get("clicks", 0) or 0),
        "sum_position": zero_based_sum_position(api_row),
    }


def replace_date_window(
    client: bigquery.Client,
    project_id: str,
    dataset_id: str,
    table_id: str,
    start_date: str,
    end_date: str,
    site_url: str,
) -> None:
    sql = f"""
DELETE FROM `{project_id}.{dataset_id}.{table_id}`
WHERE data_date BETWEEN @start_date AND @end_date
  AND site_url = @site_url
  AND search_type = @search_type
"""
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("start_date", "DATE", start_date),
            bigquery.ScalarQueryParameter("end_date", "DATE", end_date),
            bigquery.ScalarQueryParameter("site_url", "STRING", site_url),
            bigquery.ScalarQueryParameter("search_type", "STRING", SEARCH_TYPE_BQ),
        ]
    )
    client.query(sql, job_config=job_config).result()


def load_rows(client: bigquery.Client, table_ref: str, rows: list[dict]) -> None:
    if rows:
        client.load_table_from_json(rows, table_ref, job_config=bigquery.LoadJobConfig()).result()


def load_country(
    client: bigquery.Client,
    token: str,
    project_id: str,
    location: str,
    config: CountryConfig,
    start_date: str,
    end_date: str,
    dry_run: bool,
) -> None:
    print(f"{config.country}: refreshing {project_id}.{config.dataset} from {start_date} to {end_date}")
    if not dry_run:
        ensure_dataset(client, project_id, config.dataset, location)
        ensure_table(client, project_id, config.dataset, "searchdata_site_impression", SITE_SCHEMA)
        ensure_table(client, project_id, config.dataset, "searchdata_url_impression", URL_SCHEMA)

    site_rows = [
        to_site_row(config.site_url, row)
        for row in query_search_console(
            token,
            config.site_url,
            start_date,
            end_date,
            ["date", "query", "country", "device"],
        )
    ]
    url_rows = [
        to_url_row(config.site_url, row)
        for row in query_search_console(
            token,
            config.site_url,
            start_date,
            end_date,
            ["date", "page", "query", "country", "device"],
        )
    ]

    print(f"{config.country}: fetched site_rows={len(site_rows)} url_rows={len(url_rows)}")
    if dry_run:
        return

    replace_date_window(
        client,
        project_id,
        config.dataset,
        "searchdata_site_impression",
        start_date,
        end_date,
        config.site_url,
    )
    replace_date_window(
        client,
        project_id,
        config.dataset,
        "searchdata_url_impression",
        start_date,
        end_date,
        config.site_url,
    )
    load_rows(client, f"{project_id}.{config.dataset}.searchdata_site_impression", site_rows)
    load_rows(client, f"{project_id}.{config.dataset}.searchdata_url_impression", url_rows)


def main() -> None:
    args = parse_args()
    countries = [country.strip().lower() for country in args.countries.split(",") if country.strip()]
    unknown = sorted(set(countries) - set(COUNTRIES))
    if unknown:
        raise SystemExit(f"Unknown countries: {', '.join(unknown)}")

    token = get_gsc_token(args.gsc_credentials)
    client = get_bq_client(args.project_id, args.location, args.bq_credentials)

    for country in countries:
        load_country(
            client,
            token,
            args.project_id,
            args.location,
            COUNTRIES[country],
            args.start_date,
            args.end_date,
            args.dry_run,
        )


if __name__ == "__main__":
    main()
