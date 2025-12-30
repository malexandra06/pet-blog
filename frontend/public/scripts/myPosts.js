let page = 1;
const limit = 5;
const $container = $('#posts-container');
const $loading = $('#loading');
const currentUserId = window.currentUserId || null;

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return minutes + 'm ago';
    if (hours < 24) return hours + 'h ago';
    if (days < 7) return days + 'd ago';
    return date.toLocaleDateString();
}

function loadPosts() {
    $loading.show();
    $.getJSON('/api/posts/my-posts?page=' + page + '&limit=' + limit, function(posts) {
        $loading.hide();
        if (posts.length === 0) return;
        
        const postIds = posts.map(function(p) { return p.id; });
        
        posts.forEach(function(post, index) {
            const isFirst = page === 1 && index === 0;
            const $slide = $('<div class="carousel-item' + (isFirst ? ' active' : '') + '"></div>');
            
            const html = '<div class="post-container" data-post-id="' + post.id + '">' +
                '<div class="user-badge"><p>📝 My Post</p></div>' +
                '<div class="image-container">' +
                    (post.image_url ? '<img src="' + post.image_url + '" class="post-image" alt="">' : '') +
                '</div>' +
                '<div class="post-caption">' +
                    '<h5 class="post-title">' + escapeHtml(post.title) + '</h5>' +
                    '<p class="post-content">' + escapeHtml(post.content) + '</p>' +
                '</div>' +
                '<div class="post-actions">' +
                    '<button class="like-btn" data-post-id="' + post.id + '">' +
                        '<span class="heart-icon">♡</span> <span class="likes-count">0</span>' +
                    '</button>' +
                    '<button class="comment-toggle-btn" data-post-id="' + post.id + '">' +
                        '💬 <span class="comments-count">0</span>' +
                    '</button>' +
                    '<button class="post-edit-btn" data-post-id="' + post.id + '" data-title="' + escapeHtml(post.title) + '" data-content="' + escapeHtml(post.content || '') + '" data-image="' + (post.image_url || '') + '">Edit</button>' +
                    '<button class="post-delete-btn" data-post-id="' + post.id + '">Delete</button>' +
                '</div>' +
                '<div class="comments-section" id="comments-' + post.id + '">' +
                    '<form class="comment-form" data-post-id="' + post.id + '">' +
                        '<input type="text" class="comment-input" placeholder="Write a comment..." maxlength="500">' +
                        '<button type="submit" class="comment-submit-btn">Send</button>' +
                    '</form>' +
                    '<div class="comments-list" data-post-id="' + post.id + '"></div>' +
                    '<button class="load-more-comments" data-post-id="' + post.id + '" data-page="1" style="display:none;">Load more</button>' +
                '</div>' +
            '</div>';
            
            $slide.append(html);
            $container.append($slide);
        });
        
        loadLikesInfo(postIds);
        loadCommentsCount(postIds);
        page++;
    });
}

function loadLikesInfo(postIds) {
    $.ajax({
        url: '/api/likes/batch',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ postIds: postIds }),
        success: function(data) {
            for (var id in data) {
                var $btn = $('.like-btn[data-post-id="' + id + '"]');
                $btn.find('.likes-count').text(data[id].count);
                if (data[id].userLiked) {
                    $btn.addClass('liked').find('.heart-icon').text('♥');
                }
            }
        }
    });
}

function loadCommentsCount(postIds) {
    $.ajax({
        url: '/api/comments/batch',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ postIds: postIds }),
        success: function(data) {
            for (var id in data) {
                $('.comment-toggle-btn[data-post-id="' + id + '"] .comments-count').text(data[id]);
            }
        }
    });
}

$(document).on('click', '.like-btn', function() {
    var $btn = $(this);
    var postId = $btn.data('post-id');
    $btn.prop('disabled', true);
    
    $.ajax({
        url: '/api/likes/toggle',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ post_id: postId }),
        success: function(res) {
            $btn.find('.likes-count').text(res.likesCount);
            if (res.userLiked) {
                $btn.addClass('liked').find('.heart-icon').text('♥');
            } else {
                $btn.removeClass('liked').find('.heart-icon').text('♡');
            }
        },
        complete: function() {
            $btn.prop('disabled', false);
        }
    });
});

$(document).on('click', '.comment-toggle-btn', function() {
    var postId = $(this).data('post-id');
    var $section = $('#comments-' + postId);
    $section.toggleClass('active');
    if ($section.hasClass('active') && $section.find('.comments-list').children().length === 0) {
        loadComments(postId, 1);
    }
});

function loadComments(postId, pageNum) {
    var $list = $('.comments-list[data-post-id="' + postId + '"]');
    var $loadMore = $('.load-more-comments[data-post-id="' + postId + '"]');
    
    $.get('/api/comments/' + postId + '?page=' + pageNum + '&limit=5', function(res) {
        if (pageNum === 1) $list.empty();
        if (res.comments.length === 0 && pageNum === 1) {
            $list.html('<div class="no-comments">No comments yet</div>');
            $loadMore.hide();
            return;
        }
        $list.find('.no-comments').remove();
        res.comments.forEach(function(c) {
            var canDelete = currentUserId && currentUserId === c.author_id;
            $list.append(
                '<div class="comment-item" data-comment-id="' + c.id + '">' +
                    '<div class="comment-header">' +
                        '<span class="comment-author">' + escapeHtml(c.username) + '</span>' +
                        '<span class="comment-date">' + formatDate(c.created_at) + '</span>' +
                    '</div>' +
                    '<p class="comment-content">' + escapeHtml(c.content) + '</p>' +
                    (canDelete ? '<button class="comment-delete-btn" data-comment-id="' + c.id + '">Delete</button>' : '') +
                '</div>'
            );
        });
        if (res.page < res.totalPages) {
            $loadMore.data('page', pageNum + 1).show();
        } else {
            $loadMore.hide();
        }
    });
}

$(document).on('click', '.load-more-comments', function() {
    loadComments($(this).data('post-id'), $(this).data('page'));
});

$(document).on('submit', '.comment-form', function(e) {
    e.preventDefault();
    var $form = $(this);
    var postId = $form.data('post-id');
    var $input = $form.find('.comment-input');
    var content = $input.val().trim();
    if (!content) return;
    
    var $btn = $form.find('.comment-submit-btn');
    $btn.prop('disabled', true);
    
    $.ajax({
        url: '/api/comments',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ post_id: postId, content: content }),
        success: function(res) {
            var $list = $('.comments-list[data-post-id="' + postId + '"]');
            $list.find('.no-comments').remove();
            $list.prepend(
                '<div class="comment-item" data-comment-id="' + res.comment.id + '">' +
                    '<div class="comment-header">' +
                        '<span class="comment-author">' + escapeHtml(res.comment.username) + '</span>' +
                        '<span class="comment-date">Just now</span>' +
                    '</div>' +
                    '<p class="comment-content">' + escapeHtml(res.comment.content) + '</p>' +
                    '<button class="comment-delete-btn" data-comment-id="' + res.comment.id + '">Delete</button>' +
                '</div>'
            );
            var $count = $('.comment-toggle-btn[data-post-id="' + postId + '"] .comments-count');
            $count.text(parseInt($count.text()) + 1);
            $input.val('');
        },
        complete: function() {
            $btn.prop('disabled', false);
        }
    });
});

$(document).on('click', '.comment-delete-btn', function() {
    if (!confirm('Delete this comment?')) return;
    var $item = $(this).closest('.comment-item');
    var commentId = $(this).data('comment-id');
    var postId = $item.closest('.comments-section').attr('id').replace('comments-', '');
    
    $.ajax({
        url: '/api/comments',
        method: 'DELETE',
        contentType: 'application/json',
        data: JSON.stringify({ id: commentId }),
        success: function() {
            $item.remove();
            var $count = $('.comment-toggle-btn[data-post-id="' + postId + '"] .comments-count');
            $count.text(Math.max(0, parseInt($count.text()) - 1));
        }
    });
});

$(document).on('click', '.post-delete-btn', function() {
    if (!confirm('Delete this post?')) return;
    var postId = $(this).data('post-id');
    $.ajax({
        url: '/api/posts/deletePost',
        method: 'DELETE',
        contentType: 'application/json',
        data: JSON.stringify({ id: postId }),
        success: function() { location.reload(); }
    });
});

$(document).on('click', '.post-edit-btn', function() {
    $('#edit-post-id').val($(this).data('post-id'));
    $('#edit-title').val($(this).data('title'));
    $('#edit-content').val($(this).data('content'));
    var img = $(this).data('image');
    if (img) {
        $('#current-image-preview').html('<img src="' + img + '"><p>Current image</p>').show();
    } else {
        $('#current-image-preview').hide();
    }
    $('#edit-image').val('');
    $('#edit-modal').addClass('active');
});

$(document).on('click', '.modal-close, .btn-cancel', function() {
    $('#edit-modal').removeClass('active');
});

$(document).on('click', '.modal-overlay', function(e) {
    if (e.target === this) $(this).removeClass('active');
});

$('#edit-form').on('submit', function(e) {
    e.preventDefault();
    var postId = $('#edit-post-id').val();
    var title = $('#edit-title').val().trim();
    var content = $('#edit-content').val().trim();
    var imageFile = $('#edit-image')[0].files[0];
    var $btn = $('.btn-save');
    
    if (!title) { alert('Title is required'); return; }
    $btn.prop('disabled', true).text('Saving...');
    
    if (imageFile) {
        var formData = new FormData();
        formData.append('id', postId);
        formData.append('title', title);
        formData.append('content', content);
        formData.append('image', imageFile);
        $.ajax({
            url: '/api/posts/update-with-image',
            type: 'PUT',
            data: formData,
            processData: false,
            contentType: false,
            success: function() { location.reload(); },
            error: function(xhr) { alert(xhr.responseJSON?.message || 'Error'); },
            complete: function() { $btn.prop('disabled', false).text('Save'); }
        });
    } else {
        $.ajax({
            url: '/api/posts/update',
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ id: postId, title: title, content: content }),
            success: function() { location.reload(); },
            error: function(xhr) { alert(xhr.responseJSON?.message || 'Error'); },
            complete: function() { $btn.prop('disabled', false).text('Save'); }
        });
    }
});

loadPosts();
