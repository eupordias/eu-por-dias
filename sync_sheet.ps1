# Script para sincronizar dados completos da nova planilha do Google Sheets
$apiKey = "AIzaSyD7OPd8OJt2BecNHTBYg0LF31cF_7UB1VI"
$sheetId = "1XoKY-CW5ed3jJVOWD2klYGqCamiESa8_CAkRYLGEmJQ"
$url = "https://sheets.googleapis.com/v4/spreadsheets/$sheetId/values/A1:Z1000?key=$apiKey"

$res = Invoke-RestMethod -Uri $url -Method Get
$json = $res | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText("C:\Users\updia\.gemini\antigravity\scratch\edugestao-alunos\raw_sheet2.json", $json, [System.Text.Encoding]::UTF8)

Write-Host "Arquivo salvo com sucesso! Linhas totais:" $res.values.Count
