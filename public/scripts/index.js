const contentDOM = document.getElementById('content');

class Comment extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
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
}

class CommentList extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
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
}

class CommentForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            'author': '',
            'text': ''
        };
    }

    handleAuthorChange(e) {
        this.setState({
            'author': e.target.value
        });
    }

    handleTextChange(e) {
        this.setState({
            'text': e.target.value
        });
    }

    handleSubmit(e) {
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
    }

    render() {
        return (
            <form className="commentForm"
                  onSubmit={this.handleSubmit.bind(this)}>
                <input
                    type="text"
                    placeholder="Your name"
                    value={this.state.author}
                    onChange={this.handleAuthorChange.bind(this)}
                />
                <textarea
                    placeholder="Your comment"
                    value={this.state.text}
                    onChange={this.handleTextChange.bind(this)}
                />
                <input type="submit" placeholder="Post comment" />
            </form>
        );
    }
}

class CommentBox extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: []
        };
    }

    retrieveComments() {
        window.fetch(this.props.url, {
            'headers': {
                'content-type': 'application/json'
            }
        })
        .then((rawData) => rawData.json())
        .then((data) => this.setState({data}))
        .catch(console.log.bind(console));
    }

    componentDidMount() {
        this.retrieveComments();
        if (this.props.poll) {
            window.setInterval(this.retrieveComments.bind(this),
                this.props.poll);
        }
    }

    handleCommentSubmit(comment) {
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
    }

    render() {
        return (
            <div className="commentBox">
                <h1>Comments</h1>
                <CommentList data={this.state.data} />
                <CommentForm
                    onCommentSubmit={this.handleCommentSubmit.bind(this)} />
            </div>
        );
    }
}

ReactDOM.render(<CommentBox url='api/comments' poll={3000} />, contentDOM);
