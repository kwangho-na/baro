from PIL import Image
import numpy as np

def white_to_transparency(img):
    x = np.asarray(img.convert('RGBA')).copy()
    x[:, :, 3] = (255 * (x[:, :, :3] != 255).any(axis=2)).astype(np.uint8)
    return Image.fromarray(x)

def white_to_transparency_gradient(img):
    x = np.asarray(img.convert('RGBA')).copy()
    x[:, :, 3] = (255 - x[:, :, :3].mean(axis=2)).astype(np.uint8)
    return Image.fromarray(x)


def distance2(a, b):
    return (a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]) + (a[2] - b[2]) * (a[2] - b[2])

def makeColorTransparent(image, color, thresh2=0):
    image = image.convert("RGBA")
    red, green, blue, alpha = image.split()
    image.putalpha(ImageMath.eval("""convert(((((t - d(c, (r, g, b))) >> 31) + 1) ^ 1) * a, 'L')""",
        t=thresh2, d=distance2, c=color, r=red, g=green, b=blue, a=alpha))
    return image


def color_to_alpha(im, alpha_color):
    alpha = np.max(
        [
            np.abs(im[..., 0] - alpha_color[0]),
            np.abs(im[..., 1] - alpha_color[1]),
            np.abs(im[..., 2] - alpha_color[2]),
        ],
        axis=0,
    )
    ny, nx, _ = im.shape
    im_rgba = np.zeros((ny, nx, 4), dtype=im.dtype)
    for i in range(3):
        im_rgba[..., i] = im[..., i]
    im_rgba[..., 3] = alpha
    return im_rgba


def color_to_alpha_mask(im, alpha_color):
    mask = (im[..., :3] == alpha_color).all(axis=2)
    alpha = np.where(mask, 0, 255)
    ny, nx, _ = im.shape
    im_rgba = np.zeros((ny, nx, 4), dtype=im.dtype)
    im_rgba[..., :3] = im
    im_rgba[..., -1] = alpha
    return im_rgba
    
def convertImage():
    img = Image.open("src/icon.png")
    img = img.convert("RGBA")
 
    datas = img.getdata()
 
    newData = []
 
    for item in datas:
        if item[0] == 255 and item[1] == 255 and item[2] == 255:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
 
    img.putdata(newData)
    img.save("src/new-icon.png", "PNG")
    print("Successful")
    
def convertImage1():
    img = Image.open('img.png')
    img = img.convert("RGBA")
    imgnp = np.array(img)
    white = np.sum(imgnp[:,:,:3], axis=2)
    white_mask = np.where(white == 255*3, 1, 0)
    alpha = np.where(white_mask, 0, imgnp[:,:,-1])
    imgnp[:,:,-1] = alpha 
    img = Image.fromarray(np.uint8(imgnp))
    img.save("img2.png", "PNG")
 
def convertImage2():
    target_color = (255, 255, 255)
    img   = Image.open('img.png')
    imga  = img.convert("RGBA")
    datas = imga.getdata()
    newData = list()
    for item in datas:
        newData.append((
            item[0], item[1], item[2],
            max( 
                abs(item[0] - target_color[0]), 
                abs(item[1] - target_color[1]), 
                abs(item[2] - target_color[2]), 
            )  
        ))

    imgb = Image.frombuffer("RGBA", imga.size, newData, "raw", "RGBA", 0, 1)
    imgb.save("img2.png", "PNG")

 
convertImage()

'''
# load example from images included with matplotlib
fn_img = Path(plt.__file__).parent / "mpl-data" / "images" / "matplotlib_large.png"
im = plt.imread(fn_img)[..., :3]  # get rid of alpha channel already in image

target_color = [1.0, 1.0, 1.0]
im_rgba = color_to_alpha(im, target_color)
im_rgba_masked = color_to_alpha_mask(im, target_color)

fig, axes = plt.subplots(ncols=3, figsize=(12, 4))
[ax.set_facecolor("lightblue") for ax in axes]
axes[0].imshow(im)
axes[0].set_title("original")
axes[1].imshow(im_rgba)
axes[1].set_title("using distance to color")
axes[2].imshow(im_rgba_masked)
axes[2].set_title("mask on color")
'''
