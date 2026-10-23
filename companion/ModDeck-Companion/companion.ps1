# ============================================================
#  ModDeck Companion v0.1  —  game detector (Windows)
#  Watches your running games, links you into ModDeck live.
#  Keys:  [P] open trainer for the detected game
#         [O] open ModDeck        [Q] quit
# ============================================================

# ---- where your ModDeck site lives (no trailing slash) ----
$Site = "https://moddeck-uxeq.onrender.com"

# ---- games ModDeck supports (matched against running processes) ----
$Games = @(
  @{ slug="supermarket-together";  title="Supermarket Together";            match=@("supermarket together","supermarkettogether") },
  @{ slug="supermarket-simulator"; title="Supermarket Simulator";           match=@("supermarket simulator","supermarketsimulator","supermarket") },
  @{ slug="mall-simulator";        title="Mall Simulator";                  match=@("mall simulator","mallsimulator","mall") },
  @{ slug="planet-crafter";        title="The Planet Crafter";              match=@("planet crafter","planetcrafter") },
  @{ slug="gym-simulator-24";      title="Gym Simulator 24";                match=@("gym simulator","gymsimulator") },
  @{ slug="satisfactory";          title="Satisfactory";                    match=@("satisfactory","factorygame") },
  @{ slug="poppy-playtime";        title="Poppy Playtime";                  match=@("poppy") },
  @{ slug="7-days-to-die";         title="7 Days to Die";                   match=@("7daystodie","7 days to die") },
  @{ slug="gta-v";                 title="Grand Theft Auto V";              match=@("gta5","grandtheftauto5") },
  @{ slug="cyberpunk-2077";        title="Cyberpunk 2077";                  match=@("cyberpunk") },
  @{ slug="elden-ring";            title="Elden Ring";                      match=@("eldenring","elden ring") },
  @{ slug="rdr2";                  title="Red Dead Redemption 2";           match=@("rdr2","reddeadredemption") },
  @{ slug="hogwarts-legacy";       title="Hogwarts Legacy";                 match=@("hogwarts") },
  @{ slug="bg3";                   title="Baldur's Gate 3";                 match=@("bg3") },
  @{ slug="witcher-3";             title="The Witcher 3";                   match=@("witcher3","witcher 3") },
  @{ slug="starfield";             title="Starfield";                       match=@("starfield") },
  @{ slug="fallout-4";             title="Fallout 4";                       match=@("fallout4","fallout 4") },
  @{ slug="spider-man";            title="Marvel's Spider-Man Remastered";  match=@("spider-man","spiderman") },
  @{ slug="diablo-iv";             title="Diablo IV";                       match=@("diablo iv","diabloiv") }
)

function Get-DetectedGame {
  $names = (Get-Process).Name.ToLowerInvariant() | Select-Object -Unique
  foreach ($g in $Games) {
    foreach ($m in $g.match) {
      $pat = "*" + $m + "*"
      $hit = $names | Where-Object { $_ -like $pat } | Select-Object -First 1
      if ($hit) { return $g }
    }
  }
  return $null
}

$Host.UI.RawUI.WindowTitle = "ModDeck Companion"
Clear-Host
Write-Host ""
Write-Host "  ####  ##   ##    ###    ####  ##  ##   " -ForegroundColor Cyan
Write-Host "  #  #  ##   ##   ## ##   #  #  ##  ##   " -ForegroundColor Cyan
Write-Host "  ####  ######   ##  ##   ####  ######   " -ForegroundColor DarkCyan
Write-Host "  #  #  #  # #   ######   #     #  # #   " -ForegroundColor DarkCyan
Write-Host "  ## ## #  # ##  ##  ##   #     #  # ##  " -ForegroundColor DarkCyan
Write-Host ""
Write-Host "   ModDeck Companion v0.1 - game detector"    -ForegroundColor White
Write-Host "   Watching for supported games..."           -ForegroundColor Gray
Write-Host ""
Write-Host "   [P] open trainer for detected game"        -ForegroundColor DarkGray
Write-Host "   [O] open ModDeck    [Q] quit"               -ForegroundColor DarkGray
Write-Host ""
Write-Host "  ----------------------------------------"   -ForegroundColor DarkCyan

$script:last = ""
$script:cur  = $null

while ($true) {
  if ([Console]::KeyAvailable) {
    $k = [Console]::ReadKey($true)
    if ($k.Key -eq "Q") { Write-Host "  Bye - happy modding!" -ForegroundColor Gray; break }
    elseif ($k.Key -eq "O") { Start-Process $Site }
    elseif ($k.Key -eq "P" -and $script:cur) {
      Start-Process ("$Site" + "/?game=" + $script:cur.slug)
      Write-Host ("  -> opened trainer: " + $script:cur.title) -ForegroundColor Cyan
    }
  }

  $g = Get-DetectedGame
  if ($g -and $g.slug -ne $script:last) {
    $script:last = $g.slug
    $script:cur  = $g
    try { [console]::beep(880,180); [console]::beep(1180,240) } catch {}
    $stamp = (Get-Date).ToString("HH:mm:ss")
    Write-Host ""
    Write-Host ("  [" + $stamp + "]  GAME DETECTED!") -ForegroundColor Green
    Write-Host ("   " + $g.title) -ForegroundColor White
    Write-Host ("   press [P] to open its trainer")     -ForegroundColor DarkGray
  }
  elseif (-not $g -and $script:last) {
    $script:last = ""
    $script:cur  = $null
    Write-Host ""
    Write-Host ("  [" + (Get-Date).ToString("HH:mm:ss") + "]  no supported game running") -ForegroundColor DarkGray
  }

  Start-Sleep -Seconds 3
}
