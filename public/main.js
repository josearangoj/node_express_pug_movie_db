// Wait for document to be ready
$(document).ready(function(){
   // Add listener for id
   $(".delete-movie").on("click", function(e){
       // Get id when button clicked
       $target = $(e.target);
       const id = $target.attr("data-id");
       // Send request to expresss with DELETE method
       $.ajax({
           type: "delete",
           url: "/movie/" + id,
           success: function(response){
               // Show movie deleted and redirect
               alert("Movie Deleted");
               window.location.href="/";
           },
          error: function (err) {
               alert(err.resposeText)
               console.log(err.resposeText);
           }
       })
   })
});
