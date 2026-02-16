# Google Ads Customer IDs Mapping

| País / Entidad | Customer Name | Customer ID |
| :--- | :--- | :--- |
| **Alemania** | Prosegur Cash Alemania | `9589630427` | 
| **Argentina** | Prosegur Cash Argentina | `4263469660` |
| **Brasil** | Prosegur Cash Brasil | `9192320856` |
| **Chile** | Prosegur Cash Chile | `2407906005` |
| **Colombia** | Prosegur Cash Colombia | `2412701548` |
| **España (Corp)** | Prosegur Marketing Corporativo | `1703013237` |
| **Paraguay** | Prosegur Cash Paraguay | `9812854435` |
| **Perú** | Prosegur Cash Perú (Euro) | `3987648656` |
| **Portugal** | Prosegur Portugal | `8037331123` |

---

## GA4 Property IDs por País

| País | GA4 Property ID | GA4 Display Name | Timezone |
| :--- | :--- | :--- | :--- |
| **Alemania** | `297318261` | Prosegur Germany | `Europe/Berlin` |
| **Argentina** | `297153875` | Prosegur Argentina | `America/Argentina/Buenos_Aires` |
| **Brasil** | `297193664` | Prosegur Brasil | `America/Sao_Paulo` |
| **Chile** | `297349390` | Prosegur Chile | `America/Santiago` |
| **Colombia** | `297326645` | Prosegur Colombia | `America/Bogota` |
| **España** | `286664974` | Prosegur Espana | `Europe/Madrid` |
| **Paraguay** | `297430230` | Prosegur Paraguay | `America/Asuncion` |
| **Perú** | `297412517` | Prosegur Peru | `America/Lima` |
| **Portugal** | `297138761` | Prosegur Portugal | `Europe/Lisbon` |

---

## Instrucciones para Dataform

Actualizar las variables de compilación en la Release Configuration correspondiente a cada país:

*   **Variable:** `GOOGLE_ADS_CUSTOMER_ID` — El ID numérico de Google Ads (tabla superior)
*   **Variable:** `GA4_DATASET` — `analytics_{GA4_PROPERTY_ID}`
*   **Variable:** `OUTPUTS_DATASET` — `superform_outputs_{GA4_PROPERTY_ID}`
*   **Variable:** `TRANSFORMATIONS_DATASET` — `superform_transformations_{GA4_PROPERTY_ID}`
*   **Variable:** `QUALITY_DATASET` — `superform_quality_{GA4_PROPERTY_ID}`
*   **Variable:** `LOCAL_TIMEZONE` — El timezone correspondiente (tabla superior)
