#막대그래프
#matplotlib.pyplot.bar(x, 
#                                  height, 
#                                  width=0.8, 
#                                  bottom=None, 
#                                  align='center', 
#                                  data=None, 
#                                  **kwargs)
# **kwargs: color, edgecolor,linewidth, tick_label, xerr, yerr, ecolor, capsize
import matplotlib.pyplot as plt

levels = ['a', 'b', 'c']
counts = [12, 23, 18]

plt.bar(levels, counts)
plt.xlabel("level")
plt.ylabel("count")
plt.title("count per level")
plt.show()


years = ['2018','2019','2020']
incomes = [3018, 3040, 3790]

plt.barh(years, incomes)
plt.xlabel("income")
plt.ylabel("year")
plt.title("income per year")
plt.show()

plt.bar(levels, counts,width=0.4)
plt.xlabel("level")
plt.ylabel("count")
plt.title("bar width=4")
plt.show()

labels=['a','b','c']
downs=[1,2,3]
tops=[3,4,2]
plt.bar(labels,downs)
plt.bar(labels,tops,bottom=downs)
plt.title("use bottom")
plt.show()



plt.bar(levels, counts,align='edge')
plt.xlabel("levels")
plt.ylabel("count")
plt.title("align='edge'")
plt.show()

colors=['red','green','blue']
levels = ['a', 'b', 'c']
counts = [12, 23, 18]

plt.bar(levels, counts,color=colors)
plt.xlabel("level")
plt.ylabel("count")
plt.title("set color")
plt.show()

edgecolors=['green','blue','red']
plt.bar(levels, counts,color=colors,edgecolor=edgecolors)
plt.xlabel("level")
plt.ylabel("count")
plt.title("set edgecolor")
plt.show()

edgecolors=['green','blue','red']
plt.bar(levels, counts,color=colors,edgecolor=edgecolors,linewidth=3)
plt.xlabel("level")
plt.ylabel("count")
plt.title("set linewidth")
plt.show()

nums=[1,2,3,4,5,6,7,8,9]
scores=[90,80,77,65,89,99,75,69,90]
plt.bar(nums,scores)
plt.title("not set tick_label")
plt.show()
nums_str=[]
for num in nums:
    nums_str.append(num)
plt.bar(nums,scores,tick_label=nums_str)
plt.title("set tick_label")
plt.show()

errors = [2,4,3]
plt.bar(levels, counts,color=colors,yerr=errors)
plt.xlabel("level")
plt.ylabel("count")
plt.title("set yerr")
plt.show()

plt.barh(levels, counts,color=colors,xerr=errors)
plt.ylabel("level")
plt.xlabel("count")
plt.title("set xerr")
plt.show()

ecolors=['blue','red','green']
plt.bar(levels, counts,color=colors,yerr=errors,ecolor=ecolors)
plt.xlabel("levels")
plt.ylabel("count")
plt.title("set ecolor")
plt.show()

plt.bar(levels, counts,color=colors,yerr=errors,capsize=10)
plt.xlabel("levels")
plt.ylabel("count")
plt.title("set capsize")
plt.show()
출처: https://ehclub.net/676 [빅데이터 소스:티스토리]
