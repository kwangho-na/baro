import cv2
import numpy as np

image = cv2.imread("original.png", cv2.IMREAD_UNCHANGED)
height = image.shape[0]  # 5400
width = image.shape[1]  # 4500
new_height = int(height * 0.9)
new_width = int(width * 0.9)

resized_image = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
cv2.imwrite("resized.png", resized_image)
