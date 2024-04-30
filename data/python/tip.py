##
sudo mplayer -vo fbdev2:/dev/fb0 -zoom -x 1024 -y 768 video.mp4
$ sudo apt install mpv
$ mpv --vo=drm video.mp4

##
def toQImage(self, im, copy=False):
    if im is None:
        return QImage()
​
    if im.dtype == np.uint8:
        if len(im.shape) == 2:
            qim = QImage(im.data, im.shape[1], im.shape[0], im.strides[0], QImage.Format_Indexed8)
            qim.setColorTable(self.gray_color_table)
            return qim.copy() if copy else qim
​
        elif len(im.shape) == 3:
            if im.shape[2] == 3:
                qim = QImage(im.data, im.shape[1], im.shape[0], im.strides[0], QImage.Format_RGB888)
                return qim.copy() if copy else qim
            elif im.shape[2] == 4:
                qim = QImage(im.data, im.shape[1], im.shape[0], im.strides[0], QImage.Format_ARGB32)
                return qim.copy() if copy else qim

''' 
이미지 뷰어
'''

from PyQt5.QtCore import Qt
from PyQt5.QtGui import QImage, QPixmap, QPalette, QPainter
from PyQt5.QtPrintSupport import QPrintDialog, QPrinter
from PyQt5.QtWidgets import QLabel, QSizePolicy, QScrollArea, QMessageBox, QMainWindow, QMenu, QAction, \
    qApp, QFileDialog


class QImageViewer(QMainWindow):
    def __init__(self):
        super().__init__()

        self.printer = QPrinter()
        self.scaleFactor = 0.0

        self.imageLabel = QLabel()
        self.imageLabel.setBackgroundRole(QPalette.Base)
        self.imageLabel.setSizePolicy(QSizePolicy.Ignored, QSizePolicy.Ignored)
        self.imageLabel.setScaledContents(True)

        self.scrollArea = QScrollArea()
        self.scrollArea.setBackgroundRole(QPalette.Dark)
        self.scrollArea.setWidget(self.imageLabel)
        self.scrollArea.setVisible(False)

        self.setCentralWidget(self.scrollArea)

        self.createActions()
        self.createMenus()

        self.setWindowTitle("Image Viewer")
        self.resize(800, 600)

    def open(self):
        options = QFileDialog.Options()
        # fileName = QFileDialog.getOpenFileName(self, "Open File", QDir.currentPath())
        fileName, _ = QFileDialog.getOpenFileName(self, 'QFileDialog.getOpenFileName()', '',
                                                  'Images (*.png *.jpeg *.jpg *.bmp *.gif)', options=options)
        if fileName:
            image = QImage(fileName)
            if image.isNull():
                QMessageBox.information(self, "Image Viewer", "Cannot load %s." % fileName)
                return

            self.imageLabel.setPixmap(QPixmap.fromImage(image))
            self.scaleFactor = 1.0

            self.scrollArea.setVisible(True)
            self.printAct.setEnabled(True)
            self.fitToWindowAct.setEnabled(True)
            self.updateActions()

            if not self.fitToWindowAct.isChecked():
                self.imageLabel.adjustSize()

    def print_(self):
        dialog = QPrintDialog(self.printer, self)
        if dialog.exec_():
            painter = QPainter(self.printer)
            rect = painter.viewport()
            size = self.imageLabel.pixmap().size()
            size.scale(rect.size(), Qt.KeepAspectRatio)
            painter.setViewport(rect.x(), rect.y(), size.width(), size.height())
            painter.setWindow(self.imageLabel.pixmap().rect())
            painter.drawPixmap(0, 0, self.imageLabel.pixmap())

    def zoomIn(self):
        self.scaleImage(1.25)

    def zoomOut(self):
        self.scaleImage(0.8)

    def normalSize(self):
        self.imageLabel.adjustSize()
        self.scaleFactor = 1.0

    def fitToWindow(self):
        fitToWindow = self.fitToWindowAct.isChecked()
        self.scrollArea.setWidgetResizable(fitToWindow)
        if not fitToWindow:
            self.normalSize()

        self.updateActions()

    def about(self):
        QMessageBox.about(self, "About Image Viewer",
                          "<p>The <b>Image Viewer</b> example shows how to combine "
                          "QLabel and QScrollArea to display an image. QLabel is "
                          "typically used for displaying text, but it can also display "
                          "an image. QScrollArea provides a scrolling view around "
                          "another widget. If the child widget exceeds the size of the "
                          "frame, QScrollArea automatically provides scroll bars.</p>"
                          "<p>The example demonstrates how QLabel's ability to scale "
                          "its contents (QLabel.scaledContents), and QScrollArea's "
                          "ability to automatically resize its contents "
                          "(QScrollArea.widgetResizable), can be used to implement "
                          "zooming and scaling features.</p>"
                          "<p>In addition the example shows how to use QPainter to "
                          "print an image.</p>")

    def createActions(self):
        self.openAct = QAction("&Open...", self, shortcut="Ctrl+O", triggered=self.open)
        self.printAct = QAction("&Print...", self, shortcut="Ctrl+P", enabled=False, triggered=self.print_)
        self.exitAct = QAction("E&xit", self, shortcut="Ctrl+Q", triggered=self.close)
        self.zoomInAct = QAction("Zoom &In (25%)", self, shortcut="Ctrl++", enabled=False, triggered=self.zoomIn)
        self.zoomOutAct = QAction("Zoom &Out (25%)", self, shortcut="Ctrl+-", enabled=False, triggered=self.zoomOut)
        self.normalSizeAct = QAction("&Normal Size", self, shortcut="Ctrl+S", enabled=False, triggered=self.normalSize)
        self.fitToWindowAct = QAction("&Fit to Window", self, enabled=False, checkable=True, shortcut="Ctrl+F",
                                      triggered=self.fitToWindow)
        self.aboutAct = QAction("&About", self, triggered=self.about)
        self.aboutQtAct = QAction("About &Qt", self, triggered=qApp.aboutQt)

    def createMenus(self):
        self.fileMenu = QMenu("&File", self)
        self.fileMenu.addAction(self.openAct)
        self.fileMenu.addAction(self.printAct)
        self.fileMenu.addSeparator()
        self.fileMenu.addAction(self.exitAct)

        self.viewMenu = QMenu("&View", self)
        self.viewMenu.addAction(self.zoomInAct)
        self.viewMenu.addAction(self.zoomOutAct)
        self.viewMenu.addAction(self.normalSizeAct)
        self.viewMenu.addSeparator()
        self.viewMenu.addAction(self.fitToWindowAct)

        self.helpMenu = QMenu("&Help", self)
        self.helpMenu.addAction(self.aboutAct)
        self.helpMenu.addAction(self.aboutQtAct)

        self.menuBar().addMenu(self.fileMenu)
        self.menuBar().addMenu(self.viewMenu)
        self.menuBar().addMenu(self.helpMenu)

    def updateActions(self):
        self.zoomInAct.setEnabled(not self.fitToWindowAct.isChecked())
        self.zoomOutAct.setEnabled(not self.fitToWindowAct.isChecked())
        self.normalSizeAct.setEnabled(not self.fitToWindowAct.isChecked())

    def scaleImage(self, factor):
        self.scaleFactor *= factor
        self.imageLabel.resize(self.scaleFactor * self.imageLabel.pixmap().size())

        self.adjustScrollBar(self.scrollArea.horizontalScrollBar(), factor)
        self.adjustScrollBar(self.scrollArea.verticalScrollBar(), factor)

        self.zoomInAct.setEnabled(self.scaleFactor < 3.0)
        self.zoomOutAct.setEnabled(self.scaleFactor > 0.333)

    def adjustScrollBar(self, scrollBar, factor):
        scrollBar.setValue(int(factor * scrollBar.value()
                               + ((factor - 1) * scrollBar.pageStep() / 2)))


if __name__ == '__main__':
    import sys
    from PyQt5.QtWidgets import QApplication

    app = QApplication(sys.argv)
    imageViewer = QImageViewer()
    imageViewer.show()
    sys.exit(app.exec_())
# TODO QScrollArea support mouse
# base on https://github.com/baoboa/pyqt5/blob/master/examples/widgets/imageviewer.py
#
# if you need Two Image Synchronous Scrolling in the window by PyQt5 and Python 3
# please visit https://gist.github.com/acbetter/e7d0c600fdc0865f4b0ee05a17b858f2


creating an object of the QPrinter class  
self.printerObj = QPrinter()  
# setting the initial scaling factor  
self.scale_factor = 0.0  
  
# creating an object of the QLabel class to display the label  
self.image_label = QLabel()  
# setting the background color of the label to display the image using the setBackgroundRole() method and QPalette class  
self.image_label.setBackgroundRole(QPalette.Base)  
# setting the size policy of the label using the setSizePolicy() method and QSizePolicy class  
self.image_label.setSizePolicy(QSizePolicy.Ignored, QSizePolicy.Ignored)  
# setting the setScaledContents() method to True  
# to manually adjust the aspect ratio of the image  
# in the application  
self.image_label.setScaledContents(True)  
  
# creating an object of the QScrollArea class to display the scroll bar  
self.scroll_area = QScrollArea()  
# setting the background color of the scroll bar to display the image using the setBackgroundRole() method and QPalette class  
self.scroll_area.setBackgroundRole(QPalette.Dark)  
# setting the scrolling area to the image label using the setWidget() method  
self.scroll_area.setWidget(self.image_label)  
# setting the visibility of the scrolling area with the help of the setVisible() method  
self.scroll_area.setVisible(False)  
  
# setting the central widget to the scroll area using the setCentralWidget() method  
self.setCentralWidget(self.scroll_area)  

# defining the method to open the image file   
def openImage(self):  
    # creating an object of the QFileDialog.Options class  
    selections = QFileDialog.Options()  
    # calling the getOpenFileName() method to browse the image from the directory  
    file_name, _ = QFileDialog.getOpenFileName(  
        self,  
        'QFileDialog.getOpenFileName()',  
        '',  
        'Images (*.png *.jpeg *.jpg *.bmp *.gif)',  
        options = selections  
        )  
    # if the file name is not an empty string  
    if file_name:  
        # creating an object of the QImage class by passing the file name as its parameter  
        image = QImage(file_name)  
        # if the image file is empty, returning the message box displaying information  
        if image.isNull():  
            QMessageBox.information(self, "Image Viewer", "Cannot load %s." % file_name)  
            return  
  
        # using the setPixmap() method to create the off-screen image representation that can be used as a paint device  
        self.image_label.setPixmap(QPixmap.fromImage(image))  
        # setting the scale factor to 1.0  
        self.scale_factor = 1.0  
  
        # enabling the visibility of the scroll area  
        self.scroll_area.setVisible(True)  
        # enabling the "Print" action  
        self.print_opt.setEnabled(True)  
        # calling the fit_to_window() method  
        self.fit_to_window()  
        # enabling the "Fit To Window" action  
        self.fitToWindow_opt.setEnabled(True)  
        # calling the update_actions() method  
        self.update_actions()  
  
        # if the "Fit To Window" action is not checked  
        if not self.fitToWindow_opt.isChecked():  
            # calling the adjustSize() method to adjust the size of the image  
            self.image_label.adjustSize()  


