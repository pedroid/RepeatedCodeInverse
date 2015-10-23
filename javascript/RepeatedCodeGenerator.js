var script_text;
var script_lines;
window.onload = function(){
    $('#script_submit').click(function(e){analyze();});
    $('#bt_regenerate').click(function(e){regenerate_code();});
    $('#src').bind('input',function(){src_change_handler();});
    $('#auto_generated_script').bind('input',function(){script_change_handler();});
    analyze();
    //$("#re_generated_src").html(regenerate_script);
    regenerate_code();
    $('#bt_regenerate').css('border','10px solid green');
}

function element(index, type, data, rule){
    this.type = type;// type: 'num', 'str'
    this.data = data;//if(type==continuous) data=[a,b]; if(type== random) data = [a, b, c, ..., size_element-1]
    this.rule = rule;// for 'num' type: 'continuous', 'random'; for 'str' type: 'constant', 'random'
    this.next = index+1;//int
    this.index = index;    
}

function src_change_handler(){
    $('#script_submit').css('border','10px solid red');    
}

function script_change_handler(){
    $('#bt_regenerate').css('border','10px solid red');
}


function analyze(){
        //console.log('test');
        //$("#auto_generated_script").html('');
        script_text = $('#src').val();
        script_lines = script_text.split(/\n+/);
        //檢查最後一行是否是multiple spaces，如果是的話，pop()
        re_multiple_spaces = new RegExp('\\s+');
        re_alphanumeric_character = new RegExp('\\w');
        if(!re_alphanumeric_character.test(script_lines[script_lines.length-1])){
            if(re_multiple_spaces.test(script_lines[script_lines.length-1])){
                script_lines.pop();
            }else if(script_lines[script_lines.length-1]==""){
                //script_lines.pop();
                script_lines.pop();
            }
        }
        //
        
        //檢查：必須要大於等於三行，才會繼續處理
        if(script_lines.length<3){
            console.log('number of lines should be above 2.')
            return;
        }
        //
        
        

        
        var index_line = 0;
        theNumGrp = [];
        theStrGrp_ = [];
        for(index_line;index_line < script_lines.length; index_line++){            
            //truncate beginning space, and return finally            
            var re_begin_with_zero_or_more_spaces = new RegExp('^\\s*');                        
            var result_split_space_begin = script_lines[index_line].split(re_begin_with_zero_or_more_spaces);            
            if(result_split_space_begin.length == 1) { the_script_line = result_split_space_begin[0]; }
            else { the_script_line = result_split_space_begin[1]; }            
            //console.log(the_script_line);            
            //
            //check if number begin the line    
            var NumberBegin;
            var re_NumberBegin = new RegExp('^[0-9]')
            if(re_NumberBegin.test(the_script_line)){NumberBegin = 1;}
            else{NumberBegin = 0;}
            //console.log('NumberBegin:'+NumberBegin);
            //
            //append theNumGrp            
            //console.log(index_line);
            theNumGrp[index_line] = the_script_line.match(/[0-9]+/g);                        
            //
            
            //split with 'number'    
            theStrGrp_[index_line] = script_lines[index_line].split(/[0-9]+/);
        }
        
        //將第一行補零 (from undefined)
        var zero_vector = [];
        for(var i=0;i<theNumGrp[1].length;i++){
            zero_vector[i] = '0';
        }
        //theNumGrp[0] = zero_vector;        
        //        
        //除了第一行，從第二行開始處理
        theStrGrp = theStrGrp_[1];
        
        //檢查theStrGrp中是否有跳脫字元
        for(var i =0; i<theStrGrp.length; i++){
            // 將" 置換為 \"
            theStrGrp[i] = theStrGrp[i].replace("\"","\\\"");
        }
        //        
    /*
    notes:    
    1. i-th row : theNumGrp[i]
    2. j-th col : transpose(theNumGrp)[j]
     3. convert from str list to int: theNumGrp[j].map(function(x){return parseInt(x,10);})
       (the str input must be "1-D list"!)        
    */
    
    NumVar = theNumGrp[0].length;
    //get rules of each varibles
    RulesOfVar_data = [];// [0]: 第一個變數的規則; [1]：第二個變數的規則
    theNumGrp_wo_line1 = theNumGrp.slice(1,theNumGrp.length);
    VarContinuous = 1;
    var NumElement = [];
    for(var i=0;i<NumVar; i++){        
        NumElement[i] = NumList2Rule(transpose(theNumGrp/*_wo_line1*/)[i].map(function(x){return parseInt(x,10)}));
        //console.log(NumElement[i].data);
        //console.log(NumElement[i].rule);
        RulesOfVar_data[i] = NumElement[i].data;                        
    }

    //
    script ='gen_script = []\n\n';
    var int_RulesOfVar_data = [];
    for(var i=0;i<NumVar; i++){                
        int_RulesOfVar_data[i] = RulesOfVar_data[i].map(function(x){return parseInt(x,10)});
    }
    script += 'NumElement = [];//number list declaration\n';  
    for(var index=0;index<NumVar; index++){//若有數字資料為random，宣告其變數序列
        if(NumElement[index].rule == 'random'){                     
            script += 'NumElement[' + index.toString() +'] = [';
            for(var ivar = 0; ivar < NumElement[index].data.length; ivar++){
                script += NumElement[index].data[ivar].toString();
                if(ivar < NumElement[index].data.length-1){
                    script += ',';
                }
            }
            script += '];\n';
        }else{            
            script += '//the #' + index.toString() + ' variable is continuous.\n';
        }
    }
    
    var int_theNumGrp_1 = [];
    int_theNumGrp_1 = theNumGrp[1].map(function(x){return parseInt(x,10)});

    
    
    //    
    //generate javascript
    if(NumberBegin){ //sequence: theNumGrp -> theStrGrp
        
    }else{//sequence: theStrGrp -> theNumGrp            
        script += '\nfor(var i=0;i<' + (script_lines.length).toString() + ';i++){\n\n';
        //script += "\tconsole.log(";
        script += 'gen_script+=\n';
        for(var index_BothGrp=0; index_BothGrp<NumVar+theStrGrp.length; index_BothGrp++){
            //distinguish the group of number group
            if(index_BothGrp%2==0){ //theStrGrp
                indexOfSpecificGrp = index_BothGrp/2; 
                
                if(index_BothGrp == theStrGrp.length + NumVar - 1){ //EOF handling
                    script += "\t\""
                    script += theStrGrp[indexOfSpecificGrp];
                    script += "\";"                
                    script += "\n"
                }
                else{
                    script += "\t\""
                    script += theStrGrp[indexOfSpecificGrp];
                    script += "\" + \n"                
                }
            }else{//theNumGrp                   
                indexOfSpecificGrp = (index_BothGrp-1)/2;                
                if(NumElement[indexOfSpecificGrp].rule == 'continuous'){
                    //console.log(indexOfSpecificGrp);                    
                    //console.log(NumElement[indexOfSpecificGrp].data);
                    if(index_BothGrp == theStrGrp.length + NumVar - 1){ //EOF handling
                        script += "\t( " + NumElement[indexOfSpecificGrp].data[0].toString() + "+i*("+NumElement[indexOfSpecificGrp].data[1].toString()  + ")).toSring() \n"
                    }else{
                        script += "\t( " + NumElement[indexOfSpecificGrp].data[0].toString() + "+i*("+NumElement[indexOfSpecificGrp].data[1].toString()  + ")).toString() + \n"
                    }    
                }else if (NumElement[indexOfSpecificGrp].rule == 'random'){
                    
                    if(index_BothGrp == theStrGrp.length + NumVar - 1){ //EOF handling
                        //script +=  "\t NumElement[" + indexOfSpecificGrp.toString() +"][i].toString()\n"
                    }else{
                        script +=  "\t NumElement[" + indexOfSpecificGrp.toString() +"][i].toString() + \n"
                    }
                }
            }
        }
        script += "gen_script+=\'\\n'"
        script += '}'
        //console.log(script);
    }
    //

        if(script_lines[script_lines.length-1]==''){
            script_lines.pop();
        }
        //console.log(script_lines);
        $("#auto_generated_script").val(script);
        //$("#re_generated_src").html('');
        regenerate_script = eval(script);
        //$("#re_generated_src").html(regenerate_script);

    
    
    $('#script_submit').css('border','10px solid green');
    $('#bt_regenerate').css('border','10px solid red');
}



//transpose
/*example
    transpose([[1,2,3]]); //1-D array 
    transpose([[1,2,3],[4,5,6]]); //2-D array
*/
function regenerate_code(){
    $('#console_msg').html('');
    try{
        refined_script_text = eval($('#auto_generated_script').val());
    }catch(err){        
        $('#console_msg').html(err);
    }
       
    //var regenerate_script = eval(script);
    $("#re_generated_src").val(refined_script_text);
    $('#bt_regenerate').css('border','10px solid green');
}

function transpose(matrix) {  
    //console.log('example1:transpose([[1,2,3])\nexample2:transpose([[1,2,3],[4,5,6]])');
    return zeroFill(getMatrixWidth(matrix)).map(function(r, i) {
        return zeroFill(matrix.length).map(function(c, j) {
            return matrix[j][i];
        });
    });
}
function getMatrixWidth(matrix) {
    return matrix.reduce(function (result, row) {
        return Math.max(result, row.length);
    }, 0);
}
function zeroFill(n) {    
    return new Array(n+1).join('0').split('').map(Number);
}
//end of transpose

//ContinuousNumList2Rule
function NumList2Rule(NumList){
    /*
    #example:
    #input : [1,2,3] 
    #output: [1, 1]
    #function: increment    
    */
    //console.log(NumList);
    increment = NumList[1] - NumList[0]
    initialValue = NumList[0]
    var element_rule;
    var element_data=[];
    for(var indexNumList=0; indexNumList<NumList.length; indexNumList ++){
        if(indexNumList < NumList.length - 1){
            if(NumList[indexNumList+1] == NumList[indexNumList] + increment){
                element_rule = 'continuous';                
                continue;
            }else{
                element_rule = 'random';
                //console.log('check: the Number List is NOT continuous. please check it!');                
                break;
            }
        }else continue; //last data
    }
    //console.log('check: the Number List is continuous.');    
    //return [initialValue, increment]
    if(element_rule=='continuous'){
        element_data = [initialValue, increment];
    }else if (element_rule == 'random'){
        element_data = NumList;
    }
    
    var element_inst = new element(0, 'num', element_data, element_rule);
    return element_inst;    
}

function load_example1(){
    var example1_script = "reg [1:0] pin0\n"+
"reg [1:0] pin1\n"+
"reg [1:0] pin2\n"+
"reg [1:0] pin3\n"+
"reg [1:0] pin4\n"+
"reg [1:0] pin5\n"+
"reg [1:0] pin6\n"+
"reg [1:0] pin7\n"+
"reg [1:0] pin8\n"+
"reg [1:0] pin9\n"+
"reg [1:0] pin10\n"+
"reg [1:0] pin11\n"+
"reg [1:0] pin12\n"+
"reg [1:0] pin13\n"+
"reg [1:0] pin14\n"+
"reg [1:0] pin15\n"+
"reg [1:0] pin16\n"+
"reg [1:0] pin17\n"+
"reg [1:0] pin18\n"+
"reg [1:0] pin19\n"+
"reg [1:0] pin20\n"+
"reg [1:0] pin21\n"+
"reg [1:0] pin22\n"+
"reg [1:0] pin23\n"+
"reg [1:0] pin24\n"+
"reg [1:0] pin25\n"+
"reg [1:0] pin26\n"+
"reg [1:0] pin27\n"+
"reg [1:0] pin28\n"+
"reg [1:0] pin29\n"+
"reg [1:0] pin30\n"+
"reg [1:0] pin31\n"+
"reg [1:0] pin32\n"+
"reg [1:0] pin33\n"+
"reg [1:0] pin34\n"+
"reg [1:0] pin35\n"+
"reg [1:0] pin36\n"+
"reg [1:0] pin37\n"+
"reg [1:0] pin38\n"+
"reg [1:0] pin39\n"+
"reg [1:0] pin40\n"+
"reg [1:0] pin41\n"+
"reg [1:0] pin42\n"+
"reg [1:0] pin43\n"+
"reg [1:0] pin44\n"+
"reg [1:0] pin45\n"+
"reg [1:0] pin46\n"+
"reg [1:0] pin47\n"+
"reg [1:0] pin48\n"+
"reg [1:0] pin49\n"+
"reg [1:0] pin50\n"+
"reg [1:0] pin51\n"+
"reg [1:0] pin52\n"+
"reg [1:0] pin53\n"+
"reg [1:0] pin54\n"+
"reg [1:0] pin55\n"+
"reg [1:0] pin56\n"+
"reg [1:0] pin57\n"+
"reg [1:0] pin58\n"+
"reg [1:0] pin59\n"+
"reg [1:0] pin60\n"+
"reg [1:0] pin61\n"
;

    $('#src').val(example1_script);
}
function load_example2(){

    var example2_script = "	pin0<= 2'd0;\n"+
"	pin1<= 2'd0;\n"+
"	pin2<= 2'd0;\n"+
"	pin3<= 2'd0;\n"+
"	pin4<= 2'd0;\n"+
"	pin5<= 2'd0;\n"+
"	pin6<= 2'd0;\n"+
"	pin7<= 2'd0;\n"+
"	pin8<= 2'd0;\n"+
"	pin9<= 2'd0;\n"+
"	pin10<= 2'd0;\n"+
"	pin11<= 2'd0;\n"+
"	pin12<= 2'd0;\n"+
"	pin13<= 2'd0;\n"+
"	pin14<= 2'd0;\n"+
"	pin15<= 2'd0;\n"+
"	pin16<= 2'd0;\n"+
"	pin17<= 2'd0;\n"+
"	pin18<= 2'd0;\n"+
"	pin19<= 2'd0;\n"+
"	pin20<= 2'd0;\n"+
"	pin21<= 2'd0;\n"+
"	pin22<= 2'd0;\n"+
"	pin23<= 2'd0;\n"+
"	pin24<= 2'd0;\n"+
"	pin25<= 2'd0;\n"+
"	pin26<= 2'd0;\n"+
"	pin27<= 2'd0;\n"+
"	pin28<= 2'd0;\n"+
"	pin29<= 2'd0;\n"+
"	pin30<= 2'd0;\n"+
"	pin31<= 2'd0;\n"+
"	pin32<= 2'd0;\n"+
"	pin33<= 2'd0;\n"+
"	pin34<= 2'd0;\n"+
"	pin35<= 2'd0;\n"+
"	pin36<= 2'd0;\n"+
"	pin37<= 2'd0;\n"+
"	pin38<= 2'd0;\n"+
"	pin39<= 2'd0;\n"+
"	pin40<= 2'd0;\n"+
"	pin41<= 2'd0;\n"+
"	pin42<= 2'd0;\n"+
"	pin43<= 2'd0;\n"+
"	pin44<= 2'd0;\n"+
"	pin45<= 2'd0;\n"+
"	pin46<= 2'd0;\n"+
"	pin47<= 2'd0;\n"+
"	pin48<= 2'd0;\n"+
"	pin49<= 2'd0;\n"+
"	pin50<= 2'd0;\n"+
"	pin51<= 2'd0;\n"+
"	pin52<= 2'd0;\n"+
"	pin53<= 2'd0;\n"+
"	pin54<= 2'd0;\n"+
"	pin55<= 2'd0;\n"+
"	pin56<= 2'd0;\n"+
"	pin57<= 2'd0;\n"+
"	pin58<= 2'd0;\n"+
"	pin59<= 2'd0;\n"+
"	pin60<= 2'd0;\n"+
"	pin61<= 2'd0;\n"+
"	pin62<= 2'd0;\n"

;

    $('#src').val(example2_script);
}