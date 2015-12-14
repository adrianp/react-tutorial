const contentDOM = document.getElementById('content');

const Comment = React.createClass({
    // don't use arrow functions if you plan to use this:
    // https://github.com/facebook/react/issues/2927
    render: function renderComment() {
        return (
            <div className="comment">
                <h2 className="commentAuthor">
                    {this.props.author}
                </h2>
                {/* this.props.children is the content of the tag (in our case
                the actual comment */}
                {this.props.children}
            </div>
        );
    }
});

const CommentList = React.createClass({
    render: function renderCommentList() {
        const commentNodes = this.props.data.map((comment) => {
            return (
                <Comment author={comment.author} key={comment.id}>
                    {comment.text}
                </Comment>
            );
        });
        return (
            <div className="commentList">
                {commentNodes}
            </div>
        );
    }
});

const CommentForm = React.createClass({
    getInitialState: function getInitialFormState() {
        return {
            'author': '',
            'text': ''
        };
    },
    handleAuthorChange: function handleAuthorChange(e) {
        this.setState({
            'author': e.target.value
        });
    },
    handleTextChange: function handleTextChange(e) {
        this.setState({
            'text': e.target.value
        });
    },
    handleSubmit: function handleSubmit(e) {
        e.preventDefault(); // prevent navigation
        const [author, text] = [
            this.state.author.trim(),
            this.state.text.trim()
        ];
        if (text && author) {
            this.props.onCommentSubmit({author, text});
            // after submit we need to clean up the form so we can add a new
            // comment
            this.setState({
                'author': '',
                'text': ''
            });
        }
    },
    render: function renderCommentForm() {
        return (
            <form className="commentForm" onSubmit={this.handleSubmit}>
                <input
                    type="text"
                    placeholder="Your name"
                    value={this.state.author}
                    onChange={this.handleAuthorChange}
                />
                <textarea
                    placeholder="Your comment"
                    value={this.state.text}
                    onChange={this.handleTextChange}
                />
                <input type="submit" placeholder="Post comment" />
            </form>
        );
    }
});

const CommentBox = React.createClass({
    retrieveComments: function retrieveComments() {
        window.fetch(this.props.url, {
            'headers': {
                'content-type': 'application/json'
            }
        })
        .then((rawData) => rawData.json())
        .then((data) => this.setState({data}))
        .catch(console.log.bind(console));
    },
    getInitialState: function getInitialCommentBoxState() {
        return {
            data: []
        };
    },
    componentDidMount: function commentBoxDidMount() {
        this.retrieveComments();
        if (this.props.poll) {
            window.setInterval(this.retrieveComments, this.props.poll);
        }
    },
    handleCommentSubmit: function handleCommentSubmit(comment) {
        const oldComments = this.state.data;
        comment.id = Date.now();
        const newComments = oldComments.concat([comment]);
        this.setState({
            'data': newComments
        });
        window.fetch(this.props.url, {
            'method': 'post',
            'headers': {
                'content-type': 'application/json'
            },
            'body': JSON.stringify(comment)
        })
        .then((rawData) => rawData.json())
        .then((data) => this.setState({data}))
        .catch((err) => {
            this.setState({
                'data': oldComments
            });
            console.log(err);
        });
    },
    render: function renderCommentBox() {
        return (
            <div className="commentBox">
                <h1>Comments</h1>
                <CommentList data={this.state.data} />
                <CommentForm onCommentSubmit={this.handleCommentSubmit} />
            </div>
        );
    }
});

ReactDOM.render(<CommentBox url='api/comments' poll={3000} />, contentDOM);
