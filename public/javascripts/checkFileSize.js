$(document).ready(function(){
    $("form").submit( function( e ) {
        var form = this;
        e.preventDefault(); //Stop the submit for now
                                    //Replace with your selector to find the file input in your form
        var fileInput = $(this).find("input[type=file]")[0];
    
        var result = true;
        for(let i=0;i<=fileInput.files.length - 1;i++){
            let file = fileInput.files.item(i);
            fileSize = file.size;
            if((fileSize / 1024)<=50){
            }else{
                result = false;
                break;
            }
        }
        if(result){
            form.submit();
        }else{
            alert("Size image must be !> 50 KB");
        }
    });
});