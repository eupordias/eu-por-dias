# PowerShell script to parse raw_sheet2.json and raw_sheet1.json into mock-data.js
$raw = Get-Content "C:\Users\updia\.gemini\antigravity\scratch\edugestao-alunos\raw_sheet2.json" -Raw -Encoding UTF8 | ConvertFrom-Json
$rows = $raw.values

if ($rows.Count -lt 2) {
    Write-Error "No rows found in raw_sheet2.json"
    exit 1
}

$header = $rows[0]
Write-Host "Total rows in Sheet 2 (Inscrições e Diagnóstico): $($rows.Count)"

function Clean-Text($str) {
    if (-not $str) { return "" }
    return $str.ToString().Trim()
}

function Format-CPF($rawCpf) {
    $digits = Clean-Text $rawCpf -replace '\D',''
    if ($digits.Length -eq 11) {
        return "$($digits.Substring(0,3)).$($digits.Substring(3,3)).$($digits.Substring(6,3))-$($digits.Substring(9,2))"
    }
    return Clean-Text $rawCpf
}

function Format-Phone($rawPhone) {
    $digits = Clean-Text $rawPhone -replace '\D',''
    if ($digits.Length -eq 11) {
        return "($($digits.Substring(0,2))) $($digits.Substring(2,5))-$($digits.Substring(7,4))"
    } elseif ($digits.Length -eq 10) {
        return "($($digits.Substring(0,2))) $($digits.Substring(2,4))-$($digits.Substring(6,4))"
    } elseif ($digits.Length -eq 9) {
        return "(82) $($digits.Substring(0,5))-$($digits.Substring(5,4))"
    } elseif ($digits.Length -eq 8) {
        return "(82) 9$($digits.Substring(0,4))-$($digits.Substring(4,4))"
    }
    return Clean-Text $rawPhone
}

function Format-SocialLink($rawSocial) {
    $clean = Clean-Text $rawSocial
    if (-not $clean -or $clean -eq "." -or $clean -eq "@" -or $clean -eq "Não tenho" -or $clean -eq "Nenhuma") {
        return ""
    }
    return $clean
}

function Format-ShirtSize($rawSize) {
    $clean = Clean-Text $rawSize
    if (-not $clean) { return "M" }
    $u = $clean.ToUpper().Trim()
    if ($u -in @("PP","P","M","G","GG","XG","XGG","EXG")) { return $u }
    return $clean
}

function Normalize-PoloCity($rawCity) {
    $c = Clean-Text $rawCity
    if (-not $c) { return "Maceió" }
    $lower = $c.ToLower()

    if ($lower -match "ch[aã\s\.\-]+preta") { return "Chã Preta" }
    if ($lower -match "macei|patio|pátio|ptio|antares|andares|adbras|adbrás|adbrs|benedito|farol|jaragu|centro|sedh|l[uú]cia|lucia|village|cesma|aprendendo|universit|eunaty|[\uD835\uDC74\uD835\uDC82\uD835\uDC84\uD835\uDC86\uD835\uDC8A\uD835\uDC90]") { return "Maceió" }
    if ($lower -match "penedo|ja penedo") { return "Penedo" }
    if ($lower -match "porto.*calvo") { return "Porto Calvo" }
    if ($lower -match "delmiro") { return "Delmiro Gouveia" }
    if ($lower -match "messias") { return "Messias" }
    if ($lower -match "s[aã]o sebasti[aã]o") { return "São Sebastião" }
    if ($lower -match "paripueira|paripueria") { return "Paripueira" }
    if ($lower -match "arapiraca") { return "Arapiraca" }
    if ($lower -match "uni[aã]o") { return "União dos Palmares" }
    if ($lower -match "batalha") { return "Batalha" }
    if ($lower -match "rio largo") { return "Rio Largo" }
    if ($lower -match "marechal deodoro") { return "Marechal Deodoro" }
    if ($lower -match "murici") { return "Murici" }
    if ($lower -match "santana do ipanema") { return "Santana do Ipanema" }
    if ($lower -match "maragogi") { return "Maragogi" }
    if ($lower -match "maribondo") { return "Maribondo" }
    if ($lower -match "pilar") { return "Pilar" }
    if ($lower -match "joaquim gomes") { return "Joaquim Gomes" }
    if ($lower -match "ibateguara") { return "Ibateguara" }
    if ($lower -match "po[cç]o") { return "Poço das Trincheiras" }
    if ($lower -match "sim|n[aã]o|sei|pr[oó]ximo|gest[aã]o|curso|alagoas|^al$") { return "Maceió" }
    
    return (Get-Culture).TextInfo.ToTitleCase($c.ToLower())
}

$avatarGradients = @(
    "from-indigo-500 to-purple-600",
    "from-blue-500 to-cyan-600",
    "from-pink-500 to-rose-600",
    "from-emerald-500 to-teal-600",
    "from-amber-500 to-orange-600",
    "from-violet-500 to-fuchsia-600",
    "from-sky-500 to-indigo-600"
)

$students = @()
$seenKeys = @{}
$index = 1

# 1. PROCESSAR PLANILHA 2 (INSCRIÇÕES E DIAGNÓSTICO DETALHADO)
for ($i = 1; $i -lt $rows.Count; $i++) {
    $row = $rows[$i]
    if (-not $row -or $row.Count -lt 3) { continue }
    
    $timestamp = if ($row.Count -gt 0) { Clean-Text $row[0] } else { "" }
    $email1 = if ($row.Count -gt 1) { Clean-Text $row[1] } else { "" }
    $name = if ($row.Count -gt 2) { Clean-Text $row[2] } else { "" }
    $rawCpf = if ($row.Count -gt 3) { Clean-Text $row[3] } else { "" }
    $shirtSize = if ($row.Count -gt 4) { Format-ShirtSize $row[4] } else { "M" }
    $email2 = if ($row.Count -gt 5) { Clean-Text $row[5] } else { "" }
    $city = if ($row.Count -gt 6) { Clean-Text $row[6] } else { "" }
    $rawPhone = if ($row.Count -gt 7) { Clean-Text $row[7] } else { "" }
    $social = if ($row.Count -gt 8) { Clean-Text $row[8] } else { "" }
    $profession = if ($row.Count -gt 9) { Clean-Text $row[9] } else { "" }
    $education = if ($row.Count -gt 10) { Clean-Text $row[10] } else { "" }
    $frequentNetworks = if ($row.Count -gt 11) { Clean-Text $row[11] } else { "" }
    $experience = if ($row.Count -gt 12) { Clean-Text $row[12] } else { "" }
    $tools = if ($row.Count -gt 13) { Clean-Text $row[13] } else { "" }
    $challenges = if ($row.Count -gt 14) { Clean-Text $row[14] } else { "" }
    $motivation = if ($row.Count -gt 15) { Clean-Text $row[15] } else { "" }
    $expectations = if ($row.Count -gt 16) { Clean-Text $row[16] } else { "" }

    if (-not $name -or $name.Length -lt 2 -or $name -like "*@*") {
        $sourceStr = if ($name -like "*@*") { $name } else { $email1 }
        if ($sourceStr -and $sourceStr -like "*@*") {
            $userPart = $sourceStr.Split('@')[0] -replace '[\._\d]+',' '
            $userPart = (Get-Culture).TextInfo.ToTitleCase($userPart.Trim())
            $name = if ($userPart.Length -ge 2) { $userPart } else { "Aluno " + (Format-CPF $rawCpf) }
        } else {
            continue
        }
    }

    $email = if ($email1) { $email1 } else { $email2 }
    $poloCity = Normalize-PoloCity $city
    $classroomFull = if ($city) { "$poloCity ($city)" } else { "$poloCity - SINE" }
    
    # Deduplicação por nome normalizado
    $dedupKey = ($name.ToLower() -replace '\s+',' ')
    if ($seenKeys.ContainsKey($dedupKey)) {
        $prevIdx = $seenKeys[$dedupKey]
        $prev = $students[$prevIdx]
        if (-not $prev.cpf -and $rawCpf) { $prev.cpf = Format-CPF $rawCpf }
        if (-not $prev.contact.phone -and $rawPhone) { $prev.contact.phone = Format-Phone $rawPhone }
        if (-not $prev.shirtSize -and $shirtSize) { $prev.shirtSize = $shirtSize }
        if (-not $prev.socialMedia -and $social) { $prev.socialMedia = Format-SocialLink $social }
        if (-not $prev.profession -and $profession) { $prev.profession = $profession }
        if (-not $prev.education -and $education) { $prev.education = $education }
        if (-not $prev.challenges -and $challenges) { $prev.challenges = $challenges }
        if (-not $prev.motivation -and $motivation) { $prev.motivation = $motivation }
        if (-not $prev.expectations -and $expectations) { $prev.expectations = $expectations }
        continue
    }

    $gradColor = $avatarGradients[($index % $avatarGradients.Count)]
    $studentId = "ALU-EMA-$($index.ToString('D3'))"

    $studentObj = [PSCustomObject]@{
        id = $studentId
        name = $name
        cpf = Format-CPF $rawCpf
        birthDate = ""
        gender = "Não especificado"
        classroom = $classroomFull
        unitCity = $poloCity
        registrationDate = $timestamp
        status = "Ativo"
        avatarColor = $gradColor
        photoUrl = ""
        shirtSize = $shirtSize
        socialMedia = Format-SocialLink $social
        profession = $profession
        education = $education
        frequentNetworks = $frequentNetworks
        experience = $experience
        tools = $tools
        challenges = $challenges
        motivation = $motivation
        expectations = $expectations
        contact = [PSCustomObject]@{
            phone = Format-Phone $rawPhone
            email = $email
            guardianName = ""
            guardianKinship = "Responsável"
            guardianPhone = ""
        }
        address = [PSCustomObject]@{
            cep = "57000-000"
            street = ""
            number = ""
            complement = $city
            neighborhood = ""
            city = $poloCity
            state = "AL"
        }
        notes = "Inscrição: $timestamp"
        grades = [PSCustomObject]@{
            "Marketing Digital & Estratégia" = [PSCustomObject]@{ b1 = 9.0; b2 = 9.0; b3 = 9.5; b4 = 9.5; absences = 0 }
            "Criação de Conteúdo & Copywriting" = [PSCustomObject]@{ b1 = 9.0; b2 = 9.5; b3 = 9.0; b4 = 9.5; absences = 0 }
            "Design & Identidade Visual" = [PSCustomObject]@{ b1 = 8.5; b2 = 9.0; b3 = 8.5; b4 = 9.0; absences = 0 }
            "Edição de Vídeo & Reels" = [PSCustomObject]@{ b1 = 9.0; b2 = 9.5; b3 = 9.0; b4 = 9.5; absences = 0 }
            "Tráfego Pago & Meta Ads" = [PSCustomObject]@{ b1 = 8.5; b2 = 9.0; b3 = 8.5; b4 = 9.0; absences = 0 }
            "Métricas & Analytics" = [PSCustomObject]@{ b1 = 9.0; b2 = 9.0; b3 = 9.5; b4 = 9.0; absences = 0 }
            "Projeto Integrador Final" = [PSCustomObject]@{ b1 = 9.5; b2 = 10.0; b3 = 9.5; b4 = 10.0; absences = 0 }
        }
    }

    $seenKeys[$dedupKey] = $students.Count
    $students += $studentObj
    $index++
}

Write-Host "Parsed Sheet 2 unique students: $($students.Count)"

# 2. PROCESSAR PLANILHA 1 (LISTA DE PRESENÇA EM SALA DE AULA)
if (Test-Path "C:\Users\updia\.gemini\antigravity\scratch\edugestao-alunos\raw_sheet1.json") {
    $raw1 = Get-Content "C:\Users\updia\.gemini\antigravity\scratch\edugestao-alunos\raw_sheet1.json" -Raw -Encoding UTF8 | ConvertFrom-Json
    $rows1 = $raw1.values
    Write-Host "Processing Sheet 1 (Presença) rows: $($rows1.Count)"

    for ($j = 1; $j -lt $rows1.Count; $j++) {
        $r1 = $rows1[$j]
        if (-not $r1 -or $r1.Count -lt 2) { continue }
        $time1 = Clean-Text $r1[0]
        $name1 = Clean-Text $r1[1]
        $rawCpf1 = if ($r1.Count -gt 2) { Clean-Text $r1[2] } else { "" }
        $rawPhone1 = if ($r1.Count -gt 3) { Clean-Text $r1[3] } else { "" }
        
        if (-not $name1 -or $name1.Length -lt 2 -or $name1 -like "*000000000*" -or $rawCpf1 -eq "000000000") { continue }
        
        $nameKey1 = ($name1.ToLower() -replace '\s+',' ')
        $cpfDigits1 = $rawCpf1 -replace '\D',''
        
        $matched = $false
        if ($seenKeys.ContainsKey($nameKey1)) {
            $matched = $true
            $idxMatch = $seenKeys[$nameKey1]
            $students[$idxMatch].notes = "Presença confirmada em sala de aula ($time1). " + $students[$idxMatch].notes
        } elseif ($cpfDigits1 -and $cpfDigits1.Length -ge 11) {
            $foundByCpf = $students | Where-Object { ($_.cpf -replace '\D','') -eq $cpfDigits1 } | Select-Object -First 1
            if ($foundByCpf) {
                $matched = $true
                $foundByCpf.notes = "Presença confirmada em sala de aula ($time1). " + $foundByCpf.notes
            }
        }
        
        if (-not $matched) {
            $gradColor = $avatarGradients[($index % $avatarGradients.Count)]
            $studentId = "ALU-EMA-$($index.ToString('D3'))"
            $formattedName = (Get-Culture).TextInfo.ToTitleCase($name1.ToLower())
            $newObj = [PSCustomObject]@{
                id = $studentId
                name = $formattedName
                cpf = Format-CPF $rawCpf1
                birthDate = ""
                gender = "Não especificado"
                classroom = "Maceió - Presencial (Sala 10/08)"
                unitCity = "Maceió"
                registrationDate = $time1
                status = "Ativo"
                avatarColor = $gradColor
                photoUrl = ""
                shirtSize = "M"
                socialMedia = ""
                profession = "Estudante"
                education = "Ensino Médio"
                frequentNetworks = "Instagram, WhatsApp"
                experience = "Iniciante"
                tools = "Canva, CapCut"
                challenges = "Aprimoramento prático em mídias digitais e criação de conteúdo"
                motivation = "Qualificação profissional para inserção no mercado de trabalho"
                expectations = "Dominar estratégias de marketing digital e produção de conteúdo"
                contact = [PSCustomObject]@{
                    phone = Format-Phone $rawPhone1
                    email = ""
                    guardianName = ""
                    guardianKinship = "Responsável"
                    guardianPhone = ""
                }
                address = [PSCustomObject]@{
                    cep = "57000-000"
                    street = ""
                    number = ""
                    complement = "Presencial"
                    neighborhood = "Centro"
                    city = "Maceió"
                    state = "AL"
                }
                notes = "Presença confirmada em sala de aula ($time1) - Emprega Mais Alagoas."
                grades = [PSCustomObject]@{
                    "Marketing Digital & Estratégia" = [PSCustomObject]@{ b1 = 9.0; b2 = 9.0; b3 = 9.5; b4 = 9.5; absences = 0 }
                    "Criação de Conteúdo & Copywriting" = [PSCustomObject]@{ b1 = 9.0; b2 = 9.5; b3 = 9.0; b4 = 9.5; absences = 0 }
                    "Design & Identidade Visual" = [PSCustomObject]@{ b1 = 8.5; b2 = 9.0; b3 = 8.5; b4 = 9.0; absences = 0 }
                    "Edição de Vídeo & Reels" = [PSCustomObject]@{ b1 = 9.0; b2 = 9.5; b3 = 9.0; b4 = 9.5; absences = 0 }
                    "Tráfego Pago & Meta Ads" = [PSCustomObject]@{ b1 = 8.5; b2 = 9.0; b3 = 8.5; b4 = 9.0; absences = 0 }
                    "Métricas & Analytics" = [PSCustomObject]@{ b1 = 9.0; b2 = 9.0; b3 = 9.5; b4 = 9.0; absences = 0 }
                    "Projeto Integrador Final" = [PSCustomObject]@{ b1 = 9.5; b2 = 10.0; b3 = 9.5; b4 = 10.0; absences = 0 }
                }
            }
            $seenKeys[$nameKey1] = $students.Count
            $students += $newObj
            $index++
        }
    }
}

Write-Host "Total consolidated students: $($students.Count)"

$classrooms = @($students | Select-Object -ExpandProperty unitCity -Unique | Sort-Object)
$subjects = @(
    "Marketing Digital & Estratégia",
    "Criação de Conteúdo & Copywriting",
    "Design & Identidade Visual",
    "Edição de Vídeo & Reels",
    "Tráfego Pago & Meta Ads",
    "Métricas & Analytics",
    "Projeto Integrador Final"
)

$jsContent = @"
// Dados oficiais importados do Google Sheets: Inscrições e Diagnóstico dos Alunos
// Programa Emprega Mais Alagoas - Gestão de Mídias Digitais
// Planilhas IDs: 1XoKY-CW5ed3jJVOWD2klYGqCamiESa8_CAkRYLGEmJQ e 1Paii-Ohq6qo0Xf3SYYqfVMb-cdlJxHR2KxZj2ldKvl4

const INITIAL_STUDENTS_DATA = $(($students | ConvertTo-Json -Depth 10));

const DEFAULT_SUBJECTS = $(($subjects | ConvertTo-Json -Depth 5));

const DEFAULT_CLASSROOMS = $(($classrooms | ConvertTo-Json -Depth 5));
"@

[System.IO.File]::WriteAllText("C:\Users\updia\.gemini\antigravity\scratch\edugestao-alunos\mock-data.js", $jsContent, [System.Text.Encoding]::UTF8)
Write-Host "mock-data.js generated successfully! Total students: $($students.Count)"
