import sys
from PyQt5.QtGui import QPainter, QImage
from PyQt5.QtCore import QUrl, QTimer
from PyQt5.QtWidgets import QApplication
from PyQt5.QtWebEngineWidgets import QWebEngineView
from functools import partial


class Screenshot(QWebEngineView):
    def __init__(self):
        QWebEngineView.__init__(self)
        self.setFixedSize(24*20, 24*20)
        self.show()
    def capture(self, url, output_file):
        self.load(QUrl(url))
        self.loadFinished.connect(partial(self.onDone, output_file))

    def onDone(self,output_file):
        view=self
        def take_screenshot():
            print(f"save out : {output_file}")
            view.grab().save(output_file, b'PNG')
            sys.exit()
        size = view.page().contentsSize().toSize() 
        view.resize(size)
        QTimer.singleShot(2500, take_screenshot)

app = QApplication(sys.argv)
s = Screenshot()
s.capture('http://localhost/fa', 'icon.png')
app.exec_()
print("capture end")
