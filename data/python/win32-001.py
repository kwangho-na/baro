import win32.win32gui as wgui 
import pythonwin.win32ui as wui
import win32.lib.win32con as wcon
import re
import pandas as pd
import numpy as np
from a_cv2_easy_resize import easy_resize_image
from PIL import Image

dflist = []
def winEnumHandler(hwnd, ctx):
    if wgui.IsWindowVisible(hwnd):
        dflist.append((hwnd, hex(hwnd), wgui.GetWindowText(hwnd), wgui.GetWindowRect(hwnd)))

wgui.EnumWindows(winEnumHandler, None)
df=pd.DataFrame.from_records(
    dflist, columns=["aa_hwnd_int", "aa_hwnd_hex", "aa_title", "rect"]
)
maps = df.loc[
    df.aa_title.str.contains("소스 테스트 페이지", regex=False, na=False)
]
sleeptime=None
resize_width=None
resize_height=None
resize_percent=None
interpolation=None

if not maps.empty:
    hwnd=maps["aa_hwnd_int"].iloc[0]
    rc=wgui.GetWindowRect(hwnd)
    w=rc[2]-rc[0]
    h=rc[3]-rc[1]
    wDC = wgui.GetWindowDC(hwnd)
    dcObj = wui.CreateDCFromHandle(wDC)
    mDc = dcObj.CreateCompatibleDC()
    dataBitMap = wui.CreateBitmap()
    dataBitMap.CreateCompatibleBitmap(dcObj, w, h)
    mDc.SelectObject(dataBitMap)
    mDc.BitBlt((0, 0), (w, h), dcObj, (0, 0), wcon.SRCCOPY)
    signedIntsArray = dataBitMap.GetBitmapBits(True)
    img = np.frombuffer(signedIntsArray, dtype="uint8")
    img.shape = (h, w, 4)
    dcObj.DeleteDC()
    mDc.DeleteDC()
    wgui.ReleaseDC(hwnd, wDC)
    wgui.DeleteObject(dataBitMap.GetHandle())
    
    img = np.ascontiguousarray(img)
    img = easy_resize_image(img,
        width=resize_width,
        height=resize_height,
        percent=resize_percent,
        interpolation=interpolation,
    )
    im=Image.fromarray(img)
    im.save('baro.bmp')
    

print(df)
