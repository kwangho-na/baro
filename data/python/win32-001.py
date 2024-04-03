import win32.win32gui as wgui
import re
import pandas as pd


dflist = []
def winEnumHandler(hwnd, ctx):
    if wgui.IsWindowVisible(hwnd):
        dflist.append((hwnd, hex(hwnd), wgui.GetWindowText(hwnd)))

wgui.EnumWindows(winEnumHandler, None)
df=pd.DataFrame.from_records(
    dflist, columns=["aa_hwnd_int", "aa_hwnd_hex", "aa_title"]
)

print(df)
