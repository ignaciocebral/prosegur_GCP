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

## Instrucciones para Dataform

Actualizar la variable de compilación `GOOGLE_ADS_CUSTOMER_ID` en la configuración de lanzamiento (Release Configurations) para cada entorno:

*   **Variable:** `GOOGLE_ADS_CUSTOMER_ID`
*   **Valor:** (El ID numérico correspondiente de la tabla anterior)
