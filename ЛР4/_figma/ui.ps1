param(
  [Parameter(Mandatory=$true)][string]$Action,
  [int]$X = 0,
  [int]$Y = 0,
  [string]$Text = "",
  [int]$Vk = 0,
  [int]$Delay = 300
)

Add-Type -AssemblyName System.Windows.Forms
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Fg {
  [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint f, uint dx, uint dy, uint d, IntPtr e);
  [DllImport("user32.dll")] public static extern void keybd_event(byte vk, byte scan, uint f, IntPtr extra);
  [DllImport("user32.dll")] public static extern IntPtr GetAncestor(IntPtr h, uint flags);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  public struct RECT { public int Left, Top, Right, Bottom; }
}
"@

$figma = Get-Process Figma | Where-Object { $_.MainWindowTitle -ne "" } | Select-Object -First 1
$hwnd = $figma.MainWindowHandle

function Test-Focus {
  $fg = [Fg]::GetForegroundWindow()
  $root = [Fg]::GetAncestor($fg, 2)  # GA_ROOT
  return ($root -eq $hwnd)
}

switch ($Action) {
  "focus" {
    [Fg]::SetForegroundWindow($hwnd) | Out-Null
    Start-Sleep -Milliseconds 400
    if (-not (Test-Focus)) {
      # щелчок в пустую область холста поднимает окно
      [Fg]::SetCursorPos($X, $Y) | Out-Null
      Start-Sleep -Milliseconds 120
      [Fg]::mouse_event(0x0002, 0, 0, 0, [IntPtr]::Zero)
      [Fg]::mouse_event(0x0004, 0, 0, 0, [IntPtr]::Zero)
      Start-Sleep -Milliseconds 500
    }
    if (Test-Focus) { "FOCUS OK" } else { "FOCUS FAIL" }
  }
  "foreground" {
    if (Test-Focus) { "FOREGROUND FIGMA" } else { "FOREGROUND OTHER" }
  }
  "click" {
    [Fg]::SetCursorPos($X, $Y) | Out-Null
    Start-Sleep -Milliseconds 120
    [Fg]::mouse_event(0x0002, 0, 0, 0, [IntPtr]::Zero)
    [Fg]::mouse_event(0x0004, 0, 0, 0, [IntPtr]::Zero)
    Start-Sleep -Milliseconds $Delay
    "CLICK $X,$Y"
  }
  "key" {
    [Fg]::keybd_event([byte]$Vk, 0, 0, [IntPtr]::Zero)
    Start-Sleep -Milliseconds 60
    [Fg]::keybd_event([byte]$Vk, 0, 2, [IntPtr]::Zero)
    Start-Sleep -Milliseconds $Delay
    "KEY $Vk"
  }
  "combo" {
    $codes = $Text.Split(",") | ForEach-Object { [byte][int]$_ }
    foreach ($c in $codes) { [Fg]::keybd_event($c, 0, 0, [IntPtr]::Zero); Start-Sleep -Milliseconds 70 }
    foreach ($c in ($codes | Sort-Object -Descending)) {
      [Fg]::keybd_event($c, 0, 2, [IntPtr]::Zero); Start-Sleep -Milliseconds 40
    }
    Start-Sleep -Milliseconds $Delay
    "COMBO $Text"
  }
  "type" {
    [System.Windows.Forms.SendKeys]::SendWait($Text)
    Start-Sleep -Milliseconds $Delay
    "TYPE $Text"
  }
  default { throw "Неизвестное действие: $Action" }
}
