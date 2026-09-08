# Script oficial para sincronizar dados das planilhas do Google Sheets
$apiKey = "AIzaSyD7OPd8OJt2BecNHTBYg0LF31cF_7UB1VI"

# 1. Planilha 2: Inscrições e Diagnóstico (725 linhas com Motivação, Desafios, Expectativas, Camisa, etc.)
$sheet2Id = "1XoKY-CW5ed3jJVOWD2klYGqCamiESa8_CAkRYLGEmJQ"
$url2 = "https://sheets.googleapis.com/v4/spreadsheets/$sheet2Id/values/A1:Z5000?key=$apiKey"
$res2 = Invoke-RestMethod -Uri $url2 -Method Get
$json2 = $res2 | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText("C:\Users\updia\.gemini\antigravity\scratch\edugestao-alunos\raw_sheet2.json", $json2, [System.Text.Encoding]::UTF8)
Write-Host "Planilha 2 (Inscrições e Diagnóstico) sincronizada! Linhas:" $res2.values.Count

# 2. Planilha 1: Lista de Presença em Sala de Aula (42 linhas com alunos ativos)
$sheet1Id = "1Paii-Ohq6qo0Xf3SYYqfVMb-cdlJxHR2KxZj2ldKvl4"
$url1 = "https://sheets.googleapis.com/v4/spreadsheets/$sheet1Id/values/A1:Z500?key=$apiKey"
$res1 = Invoke-RestMethod -Uri $url1 -Method Get
$json1 = $res1 | ConvertTo-Json -Depth 10
[System.IO.File]::WriteAllText("C:\Users\updia\.gemini\antigravity\scratch\edugestao-alunos\raw_sheet1.json", $json1, [System.Text.Encoding]::UTF8)
Write-Host "Planilha 1 (Lista de Presença) sincronizada! Linhas:" $res1.values.Count
