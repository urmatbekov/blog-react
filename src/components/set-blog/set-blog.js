import React, {Component} from 'react'
import withBlogService from "../provider/service/with-blog-service";
import CKEditor from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import withLogin from "../provider/login/with-login";
import {Redirect} from "react-router-dom";
import Swal from "sweetalert2";
import Loader from "../loader";
import SetBlogRender from "./set-blog-render";
import notice from "../hooks/alerts";

const initialState = {
    title: '',
    body: '',
    short_body: '',
    type: 'a',
    errors: {},
}

class SetBlog extends Component {

    state = {
        ...initialState,
        options: {},
        loading: true
    }

    componentDidMount() {
        this.props.getOptions('/news/').then((data) => {
            this.setState({options: data.actions['POST'], loading: false})
        })
    }

    onSubmit = (e) => {
        e.preventDefault()
        this.props.setBlog(this.state).then((data) => {
            this.setState(initialState)
            notice('Сохранено', 'success')
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
        this.setState({
            [elem.name]: elem.value
        })
    }

    onChangeCKEditor = (data) => {
        this.setState(data)
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

        return <SetBlogRender onChangeInputs={this.onChangeInputs} onSubmit={this.onSubmit}
                              onChangeCKEditor={this.onChangeCKEditor} state={this.state}/>
    }

}

const mapMethodsToProps = (blogService) => {
    return {
        setBlog: blogService.setBlog,
        getOptions: blogService.getOptions
    }
}

export default withBlogService(mapMethodsToProps)(withLogin(SetBlog));
