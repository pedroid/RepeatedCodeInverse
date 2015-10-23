import re
#from fn_inverse_verilog import ContinuousNumList2Rule

def ContinuousNumList2Rule(NumList):
    #example:
    #input : [1,2,3] 
    #output: [1, 1]
    #function: increment
    increment = NumList[1] - NumList[0]
    initialValue = NumList[0]
    #check continuously of rule        
    for indexNumList in range(len(NumList)):
        if(indexNumList<len(NumList)-1):            
            if(NumList[indexNumList+1] == NumList[indexNumList]+increment):                
                continue;
            else:
                print 'check: the Number List is NOT continuous. please check it!'
                return;
        else: #last data
            continue;
    #
    print 'check: the Number List is continuous.'
    return [initialValue, increment]

def RepeatedCodeInverse(AllLine):    
    NumLines = len(AllLine)
    #split with 'number'
    #
    theNumGrp = []
    index_line = 0
    numberPattern = '[0-9]+'
    theStrGrp = re.split(numberPattern, AllLine[0].split('\n')[0])
    for eachLine in AllLine:
        #truncate beginnign space, and return finally
        eachLine = eachLine.split('\n')[0]
        if(len(re.split('^\s+',eachLine))>1):        
            eachLine = re.split('^\s+',eachLine)[1]
        #
        #check if number begin the line    
        if((re.search('^'+numberPattern, eachLine))):
            NumberBegin = 1
        else: NumberBegin = 0
        #
        theNumGrp.append(re.findall(numberPattern, eachLine)) # data ex: ['01', '888', '882']    
        #
        index_line = index_line + 1

    # notes:    
    # 1. i-th row : theNumGrp[i]
    # 2. j-th col : zip(*theNumGrp)[j]
    # 3. convert from str list to int: map(int, zip(*theNumGrp)[j])
    #   (the str input must be "1-D list"!)
    #
    NumVar = len(theNumGrp[0])
    #get rules of each varibles
    RulesOfVar = []
    for i in range(NumVar):
        RulesOfVar.append(ContinuousNumList2Rule(map(int, zip(*theNumGrp)[i])))
    #
    #generate python script
    if(NumberBegin): #sequence: theNumGrp -> theStrGrp
        pass
    else: #sequence: theStrGrp -> theNumGrp
        script = 'for i in range('+ str(NumLines)+'):\n'
        script += '\tprint '
        for index_BothGrp in range(len(theStrGrp)+NumVar):
            #distinguish the group of number group
            if(index_BothGrp%2==0): #theStrGrp
                script += "\""
                indexOfSpecificGrp = index_BothGrp/2;            
                script += theStrGrp[indexOfSpecificGrp];
                if(index_BothGrp == len(theStrGrp)+NumVar - 1): #EOF handling
                    script += "\""
                else:
                    script += "\" + "
            else:#theNumGrp            
                indexOfSpecificGrp = (index_BothGrp-1)/2;
                #script += str(RulesOfVar[0])            
                if(index_BothGrp == len(theStrGrp)+NumVar - 1): #EOF handling
                    script += "str( " + str(RulesOfVar[indexOfSpecificGrp][0]) + "+i*("+str(RulesOfVar[indexOfSpecificGrp][1])  + ")) "
                else:
                    script += "str( " + str(RulesOfVar[indexOfSpecificGrp][0]) + "+i*("+str(RulesOfVar[indexOfSpecificGrp][1])  + ")) + "
            #        
        print script
