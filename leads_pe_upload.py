from google.oauth2 import service_account
from google.cloud import bigquery
import gspread
import pandas as pd
import numpy as np
import logging
from googleapiclient.discovery import build

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Authentication and client setup
key_path = r'C:\Users\ES00697029\OneDrive - Prosegur Cia. De Seguridad, S.A\Programming-ESAAD87518088\Apps Script\spring-line-421422-9ba3099c2241.json'
scopes = [
    'https://www.googleapis.com/auth/bigquery',
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file'
]

credentials = service_account.Credentials.from_service_account_file(key_path, scopes=scopes)
bq_client = bigquery.Client(credentials=credentials, project='spring-line-421422')

# Modified query to properly handle NULL and empty dates
query = """
  SELECT `Id_contacto`, `Id_llamada`, `Idlead` AS `Idlead`, `fecha_entrada` AS `fecha_entrada`, `Fecha___Hora_Fin_gesti__n` AS `Fecha___Hora_Fin_gesti__n`, `E_mail` AS `E_mail`, `Utm_campaign` AS `Utm_campaign`, `Utm_content` AS `Utm_content`, `Utm_source` AS `Utm_source`, `Categoria` AS `Categoria`, `Resoluci__n` AS `Resoluci__n`
  FROM (
    SELECT 
    cast(Id_contacto as string) Id_contacto,
    cast(Id__llamada as string) Id_llamada,
      Idlead,
      CASE 
        WHEN fecha_entrada IS NULL OR TRIM(CAST(fecha_entrada AS STRING)) = '' 
        THEN NULL 
        ELSE SPLIT(CAST(fecha_entrada AS STRING), ' ')[OFFSET(0)]
      END AS fecha_entrada,
      CASE
        WHEN Fecha___Hora_Fin_gesti__n IS NULL OR TRIM(CAST(Fecha___Hora_Fin_gesti__n AS STRING)) = ''
        THEN NULL
        ELSE SPLIT(CAST(Fecha___Hora_Fin_gesti__n AS STRING), ' ')[OFFSET(0)]
      END AS Fecha___Hora_Fin_gesti__n,
      E_mail,
      Utm_campaign,
      Utm_content,
      Utm_source,
      Categoria,
      Resoluci__n
    FROM `spring-line-421422.Data_Peru_Processed.cc_sabana_leads_pe_vn`
    WHERE Categoria LIKE '%CONTACTO CUALIFICADO%'
  )
"""
df = bq_client.query(query).to_dataframe()

# Inspect data types
logger.info("Data types in DataFrame:")
logger.info(df.dtypes)

# Convert columns to appropriate formats, preserving dates
for column in df.columns:
    if pd.api.types.is_datetime64_any_dtype(df[column]) or pd.api.types.is_datetime64_dtype(df[column]) or str(df[column].dtype).startswith('date'):
        df[column] = df[column].apply(lambda x: x if pd.notnull(x) else None)
    elif pd.api.types.is_numeric_dtype(df[column]):
        df[column] = df[column].replace({np.nan: None})
    else:
        df[column] = df[column].fillna('').astype(str)

# Function to find spreadsheet by name
def get_or_create_spreadsheet(gc, spreadsheet_name):
    try:
        spreadsheet = gc.open(spreadsheet_name)
        logger.info(f"Found existing spreadsheet: {spreadsheet_name}")
        return spreadsheet
    except gspread.exceptions.SpreadsheetNotFound:
        logger.info(f"Creating new spreadsheet: {spreadsheet_name}")
        return gc.create(spreadsheet_name)

# Authorize and get or create spreadsheet
gc = gspread.authorize(credentials)
spreadsheet_name = 'leads_peru_date'
spreadsheet = get_or_create_spreadsheet(gc, spreadsheet_name)
sheet = spreadsheet.get_worksheet(0)

# Clear existing content before updating
sheet.clear()

# Convert DataFrame to list of lists and upload
data = [df.columns.tolist()] + df.values.tolist()
sheet.update(values=data, range_name='A1')

# Initialize Google Sheets API service
sheets_service = build('sheets', 'v4', credentials=credentials)

# Define the find-and-replace request for columns B and C
requests = [
    {
        'findReplace': {
            'find': "^'",             # Regex to match single quote at the start
            'replacement': '',        # Replace with empty string
            'matchEntireCell': False, # Replace within cell content, not entire cell
            'searchByRegex': True,    # Enable regex matching
            'range': {
                'sheetId': sheet.id,     # Worksheet ID
                'startRowIndex': 0,      # Start from row 1 (0-based index)
                'startColumnIndex': 1,   # Column B (index 1)
                'endColumnIndex': 3      # Column C (index 2, exclusive end is 3)
            }
        }
    }
]

# Execute the batch update
body = {'requests': requests}
response = sheets_service.spreadsheets().batchUpdate(
    spreadsheetId=spreadsheet.id,
    body=body
).execute()

logger.info(f"Find and replace completed: {response}")

# List of emails to share with
email_list = [
    'ignacio.cebral@prosegur.com',
    'manuel.somoza@makingscience.com'
]

# Share the spreadsheet with each user
for email in email_list:
    spreadsheet.share(
        email,
        perm_type='user',
        role='writer',
        notify=True,
        email_message=f'You have been granted access to the spreadsheet: {spreadsheet_name}.'
    )

print(f"Archivo creado exitosamente. URL: {spreadsheet.url}")