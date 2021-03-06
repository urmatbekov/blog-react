import React, {Component} from 'react'
import withBlogService from "../provider/service/with-blog-service";
import withLogin from "../provider/login/with-login";
import {withRouter, Redirect} from "react-router-dom";
import Loader from "../loader";
import SetBlogRender from "./set-blog-render";
import notice from "../hooks/alerts";

const initialState = {
    data: {
        title: '',
        body: '',
        short_body: '',
        type: 'a',
    },
    errors: {},
}

class SetBlog extends Component {

    state = {
        ...initialState,
        options: {},
        loading: true
    }

    componentDidMount() {
        this.getOptions()
    }

    getOptions = () => {
        const {data, getOptions} = this.props
        if (data) {
            this.setState({data})
        }
        getOptions('/news/').then(({actions}) => {
            if (actions) {
                this.setState({options: actions['POST'], loading: false})
            } else {
                this.props.unAuth()
            }
        })
    }

    onSubmit = (e) => {
        e.preventDefault()
        const postServer = this.props.updateBlog || this.props.setBlog
        postServer(this.state.data).then((data) => {
            this.setState(initialState)
            notice('Сохранено', 'success')
            this.props.history.replace(`/blog/${data.id}`)
        }).catch(async ({res}) => {
            if (res && res.status === 400) {
                const errors = await res.json()
                this.setState({
                    errors
                })
            }
        })
    }

    onChangeInputs = (e) => {
        const elem = e.target
        this.setState(({data}) => {
            return {
                data: {...data, [elem.name]: elem.value}
            }
        })
    }

    onChangeFile = (e) => {
        const elem = e.target
        this.setState(({data}) => {
            return {
                data: {...data, image: elem.files[0]}
            }
        })
    }

    onChangeCKEditor = (dataCK) => {
        this.setState(({data}) => {
            return {
                data: {...data, ...dataCK}
            }
        })
    }


    render() {
        const {loading} = this.state;
        if (!this.props.isAuthenticated) {
            notice('Вы не авторизованы', 'warning')
            return <Redirect to='/login'/>
        }
        if (loading) {
            return <Loader/>
        }

        return <SetBlogRender onChangeFile={this.onChangeFile} onChangeInputs={this.onChangeInputs}
                              onSubmit={this.props.onSubmit || this.onSubmit}
                              onChangeCKEditor={this.onChangeCKEditor} state={this.state}/>
    }

}

const mapMethodsToProps = (blogService) => {
    return {
        setBlog: blogService.setBlog,
        getOptions: blogService.getOptions
    }
}

export default withBlogService(mapMethodsToProps)(withLogin(withRouter(SetBlog)));
