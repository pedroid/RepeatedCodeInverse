# RepeatedCodeInverse
written by ntuyusheng@gmail.com

Convert a paragragh of codes or words with regular rules into a function with for loop and statements.
找到數行程式碼中數字遞迴的規則，產生"以迴圈產生該原始碼的程式"

[程式範例(用javascript實現的版本)](http://pedroid.github.io/RepeatedCodeInverse/RepeatedCodeGenerator.html)

當使用硬體描述語言開發數位電路時，因為電路的特色就是許多I/O 控制是平行在運行的. 因此常常會需要大量的宣告變數，以及指定值給這些變數。舉例來說，工作上我們若需要宣告64通道的I/O，並將這些通道訊號指定給特定的前級訊號。在原始碼上常常會看到這樣格式的內容：

```
  #written in Verilog
  #register declaration
  reg [1:0] pin0;
  reg [1:0] pin1;
  reg [1:0] pin2;
  //...
  reg [1:0] pin63;
  
  #pin assignment
  always@(*)begin
    pin0 <= 2'd0;
    pin1 <= 2'd0;
    pin2 <= 2'd0;
    //...
    pin63 <= 2'd0;
  end
```

程式設計師為了節省時間，常常會開發小程式來協助工作上大量重覆的動作。要寫出上列的程式碼，常常會用其他語言(如Python)來產生該verilog 語法：
```
for i in range(64):
  print 'reg [1:0] pin' + str(i)
  
print 'always@(*)begin'
for i in range(64):
  print '\tpin' + str(i) + '<= 2\'d0'

print 'end'
```

這樣短短幾行就可以產生出我們想要的程式碼了，這真是一件很美好的事情。原本需要不斷的複製貼上，然後再一一修改變數的動作都免了，省了非常多的時候。

然而，工作上我們最常做的時候反而不是從零開始撰寫程式，而可能是承接前人的專案，或是將自己過去開發的程式再擴充、修改。比如說，我們可能要將64通道的系統擴充到128的系統，或是一群i/o加上一個可控制的遮罩，以供測試用。有時運氣好，我們可以找到之前寫的小程式，只要小小地修改參數後就可以輕鬆的完成這份工作。若是找不到或是不想花時間去檔案海中找，那重新寫一份可能是次快(搞不好更快)的方法。而在這個repo中開發的程式，可以幫助程式設計師找到程式碼中的遞迴邏輯，減少程式設計師重新寫符合原程式碼模式的時間。

延續之前的程式例子，我們想要把原本的程式碼改成如下：

```
  #written in Verilog
  #register declaration
  reg [1:0] pin0;
  reg [1:0] pin1;
  reg [1:0] pin2;
  //...
  reg [1:0] pin127;
  
  #pin assignment
  always@(*)begin
    pin0 <= enable[0]?2'd0:1;
    pin1 <= enable[1]?2'd0:1;
    pin2 <= enable[2]?2'd0:1;
    //...
    pin127 <= enable[127]?2'd0:1;
  end
```

可以看到我們將通道擴充了(64->128)，此外為了每個pin都能獨立測試，在每個pin上都各別加上了一個開關。這個動作在某些工作中滿常見的。一般而言，若是沒有原始產生該段程式碼的開發程式，我們還是可以從頭去撰寫，這估計也花不了多少時間，然而，重新寫作這件事情本身也是一個重覆的動作不是嗎？當然要有法子來幫助懶惰的程式設計師減輕我們的負擔啦。RepeatedCodeInverse就是基於這個目的下去開發的！

使用上，分成幾個步驟：
1、將想要改寫的程式碼獨立擷取出來到一文字檔
2、執行RepeatedCodeInverse工具，將步驟一的文字檔作為程式的輸入，
3、程式判斷出該段程式的遞迴規律，並輸出以特定語法(預設為python)的程式碼
4、使用者去修改該程式碼，改變自己想要的變數，在本文件所列舉中的例子為通道數，以及加入遮罩
5、輸出程式碼，並貼回自己的程式。

example1:(written in python)
```
from fn_inverse_verilog import ContinuousNumList2Rule, RepeatedCodeInverse
#read in file
filename = 'example1.txt'
f = open(filename, 'r')
AllLine = f.readlines()
RepeatedCodeInverse(AllLine)
```
程式的輸出：
```
for i in range(64):
	print 'reg [' + str( 1+i*(0)) + ':' + str( 0+i*(0)) + '] pin' + str( 0+i*(1)) + ''
```
若要將程式修改為128 的版本，就只要修改對應的參數即可：
```
for i in range(128):
	print 'reg [' + str( 1+i*(0)) + ':' + str( 0+i*(0)) + '] pin' + str( 0+i*(1)) + ''
```

example2:(written in python)
```
from fn_inverse_verilog import ContinuousNumList2Rule, RepeatedCodeInverse
#read in file
filename = 'example2.txt'
f = open(filename, 'r')
AllLine = f.readlines()
RepeatedCodeInverse(AllLine)
```
程式的輸出：
```
for i in range(64):
	print '	pin' + str( 0+i*(1)) + '<= ' + str( 2+i*(0)) + ''d' + str( 0+i*(0)) + ''
```
若要將程式修改為128 的版本，就只要修改對應的參數即可：
```
for i in range(128):
	print '	pin' + str( 0+i*(1)) + '<= enable[' + str(i) + ']?' + str( 2+i*(0)) + ''d' + str( 0+i*(0)) + ':0;'
```

