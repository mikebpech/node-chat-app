var socket = io();

function scrollToBottom () {
    //Selectors
    var messages = $('#messages');
    var newMessage = messages.children('li:last-child');
    //Heights
    var clientHeight = messages.prop('clientHeight');
    var scrollTop = messages.prop('scrollTop');
    var scrollHeight = messages.prop('scrollHeight');
    var newMessageHeight = newMessage.innerHeight();
    var lastMessageHeight = newMessage.prev().innerHeight();
    //Calculations
    if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
        messages.scrollTop(scrollHeight);
    }
};

socket.on('connect', function () {
    var params = $.deparam(window.location.search);
    
    socket.emit('join', params, function (err) {
        if (err) {
            alert(err);
            window.location.href = '/';
        } else {
            console.log('no error');
        }
    });
});

socket.on('disconnect', function () {
    console.log('Disconnected from server.');
});

socket.on('newMessage', function (message) {
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var template = $("#message-template").html();
    var html = Mustache.render(template, {
        text: message.text,
        from: message.from,
        createdAt: formattedTime
    });
    
    $("#messages").append(html);
    scrollToBottom();
});

socket.on('newLocationMessage', function (message) {
    var formattedTime = moment(message.createdAt).format('h:mm a');
    var template = $("#location-message-template").html();
    var html = Mustache.render(template, {
        text: message.text,
        from: message.from,
        url: message.url,
        createdAt: formattedTime
    });

    $('#messages').append(html);
    scrollToBottom();
});

$("#message-form").on('submit', function (e) {
    var params = $.deparam(window.location.search);
    e.preventDefault();

    var messageTextBox = $('[name=message]');

    socket.emit('createMessage', {
        from: params.name,
        text: messageTextBox.val()
    }, function () {
        messageTextBox.val('');
    });
});

var locationButton = $('#sendLocation');

locationButton.on('click', function () {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.');
    }

    locationButton.attr('disabled', 'disabled').text('Sending location...');

    navigator.geolocation.getCurrentPosition(function (position) {
        locationButton.removeAttr('disabled').text('Send location');
        socket.emit('createLocationMessage', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
    }, function (e) {
        locationButton.removeAttr('disabled').text('Send location');
        alert('Unable to fetch location!');
    });
});