/* @flow */

import React, {Component, Element} from 'react'

import SelectedTodoModel from '../facets/SelectedTodoModel'
import UserTodosModel from '../facets/UserTodosModel'

export default class SelectedTodo extends Component {
    props: {
        selected: SelectedTodoModel,
        user: UserTodosModel
    };

    render(): Element {
        const {selected, user} = this.props
        const {
            id,
            title,
            description,
            user: selectedTodoUser,
        } = selected
        const {loading, invalid, error} = selected.$meta
        return (
            <div>

            </div>
        )
    }
}
