$( document ).ready(function() {
  let  items = [];
  let  itemsRaw = [];
  
  $.getJSON('/api/books', function(data) {
    //let  items = [];
    itemsRaw = data;
    $.each(data, function(i, val) {
      items.push('<li class="bookItem" id="' + i + '">' + val.title + ' - ' + val.commentcount + ' comments</li>');
      return ( i !== 14 );
    });
    if (items.length >= 15) {
      items.push('<p>...and '+ (data.length - 15)+' more!</p>');
    }
    $('<ul/>', {
      'class': 'listWrapper',
      html: items.join('')
      }).appendTo('#display');
  });
  
  let  comments = [];
  $('#display').on('click','li.bookItem',function() {
    $("#detailTitle").html('<b>'+itemsRaw[this.id].title+'</b> (id: '+itemsRaw[this.id]._id+')');
    $.getJSON('/api/books/'+itemsRaw[this.id]._id, function(data) {
      comments = [];
      $.each(data.comments, function(i, val) {
        comments.push('<li>' +val+ '</li>');
      });
      comments.push('<br><form id="newCommentForm"><input style="width:300px" type="text" class="form-control" id="commentToAdd" name="comment" placeholder="New Comment">');
      comments.push('<br><button type="submit" value="Submit" class="btn btn-info addComment" id="'+ data._id+'">Add Comment</button>');
      comments.push('<button class="btn btn-danger deleteBook" id="'+ data._id+'">Delete Book</button></form>');
      $('#detailComments').html(comments.join(''));
    });
  });

  $('#bookDetail').on('click','button.deleteBook',function(event) {
    event.preventDefault();
    $.ajax({
      url: '/api/books/'+this.id,
      type: 'delete',
      success: function(data) {
        //update list
        $('#detailComments').html('<p style="color: red;">'+data+'<p>');
        let id = $('#detailTitle').text().match(/(?<=\(id: )\w*(?=\))/g)[0];
        let index = itemsRaw.findIndex(book => id === book._id);
        items.splice(index, 1);
        itemsRaw.splice(index, 1);
        $('.listWrapper').html(items.join(''));
      }
    });
  });  
  
  $('#bookDetail').on('click','button.addComment',function(event) {
    event.preventDefault();

    let  newComment = $('#commentToAdd').val();
    $.ajax({
      url: '/api/books/'+this.id,
      type: 'post',
      dataType: 'json',
      data: $('#newCommentForm').serialize(),
      success: function(data) {
        comments.splice(-3, 0, '<li>' +newComment+ '</li>'); //adds new comment to bottom of list
        $('#detailComments').html(comments.join(''));
        
        //Update items, itemsRaw and book display with updated comment count
        let index = itemsRaw.findIndex(book => data._id === book._id);
        itemsRaw[index].commentcount++;
        items[index] = '<li class="bookItem" id="' + index + '">' + data.title + ' - ' + itemsRaw[index].commentcount + ' comments</li>';
        $('.listWrapper').html(items.join(''));
      }
    });
  });
  
  $('#newBook').click(function(event) {
    event.preventDefault();

    $.ajax({
      url: '/api/books',
      type: 'post',
      dataType: 'json',
      data: $('#newBookForm').serialize(),
      success: function(data) {
        //update list
        itemsRaw.push(
          {
            _id: data._id,
            title: data.title,
            commentcount: data.comments.length
          });
        
        if (items.length < 15) {
          items.push('<li class="bookItem" id="' + items.length + '">' + data.title + ' - 0 comments</li>');
        }
        else if (items.length == 15){
          items.push('<p>...and 1 more!</p>');
        }
        else {
          let num = parseInt(items[15].match(/\d+/)[0]) + 1;
          items[15] = '<p>...and '+ num +' more!</p>';
        }

        $('.listWrapper').html(items.join(''));
      }
    });
  });
  
  $('#deleteAllBooks').click(function() {
    $.ajax({
      url: '/api/books',
      type: 'delete',
      success: function(data) {
        //update list
        items = [];
        itemsRaw = [];
        $('#detailComments').html('<p style="color: red;">'+data+'<p>');
        $('.listWrapper').html(items.join(''));
      }
    });
  }); 
  
});