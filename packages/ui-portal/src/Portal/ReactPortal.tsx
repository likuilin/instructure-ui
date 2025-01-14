/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 - present Instructure, Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import React from 'react'
import PropTypes from 'prop-types'
import ReactDOM from 'react-dom'

import { passthroughProps } from '@instructure/ui-react-utils'
import { bidirectional, BidirectionalProps } from '@instructure/ui-i18n'
import { element } from '@instructure/ui-prop-types'

type Props = {
  open?: boolean
  onOpen?: (DOMNode: HTMLSpanElement | null) => any
  onClose?: (...args: any[]) => any
  mountNode?: any // TODO: PropTypes.oneOfType([element, PropTypes.func]),
  insertAt?: 'bottom' | 'top'
  elementRef?: (...args: any[]) => any
}

/**
---
private: true
---
@module ReactPortal
**/
@bidirectional()
class ReactPortal extends React.Component<Props & BidirectionalProps> {
  static propTypes = {
    /**
     * Whether or not the `<Portal />` is open
     */
    open: PropTypes.bool,

    /**
     * Callback fired when `<Portal />` content has been mounted in the DOM
     */
    onOpen: PropTypes.func,

    /**
     * Callback fired when `<Portal />` has been unmounted from the DOM
     */
    onClose: PropTypes.func,

    /**
     * An element or a function returning an element to use as the mount node
     * for the `<Portal />` (defaults to `document.body`)
     */
    mountNode: PropTypes.oneOfType([element, PropTypes.func]),
    /**
     * Insert the element at the 'top' of the mountNode or at the 'bottom'
     */
    insertAt: PropTypes.oneOf(['bottom', 'top']),

    /**
     * The children to be rendered within the `<Portal />`
     */
    children: PropTypes.node,
    /**
     * provides a reference to the underlying html element
     */
    elementRef: PropTypes.func,
    // eslint-disable-next-line react/require-default-props
    dir: PropTypes.oneOf(Object.values(bidirectional.DIRECTION))
  }

  static defaultProps = {
    open: false,
    insertAt: 'bottom',
    // @ts-expect-error ts-migrate(6133) FIXME: 'DOMNode' is declared but its value is never read.
    onOpen: (DOMNode: HTMLSpanElement | null) => {},
    onClose: () => {},
    mountNode: undefined,
    children: null,
    // @ts-expect-error ts-migrate(6133) FIXME: 'el' is declared but its value is never read.
    elementRef: (el) => {}
  }

  constructor(props: Props) {
    super(props)

    this.state = {
      mountNode: this.findMountNode(props)
    }
  }

  DOMNode: HTMLSpanElement | null = null

  componentDidMount() {
    // If Portal is mounting in an open condition fire onOpen handler
    if (this.props.open && typeof this.props.onOpen === 'function') {
      this.props.onOpen(this.DOMNode)
    }
  }

  // @ts-expect-error ts-migrate(7006) FIXME: Parameter 'prevProps' implicitly has an 'any' type... Remove this comment to see the full error message
  componentDidUpdate(prevProps) {
    const mountNode = this.findMountNode(this.props)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mountNode' does not exist on type 'Reado... Remove this comment to see the full error message
    if (mountNode !== this.state.mountNode) {
      // set state here to make the component re-render
      this.setState({ mountNode })
    }

    // If Portal was closed but is now open fire onOpen handler
    if (
      this.props.open &&
      !prevProps.open &&
      typeof this.props.onOpen === 'function'
    ) {
      this.props.onOpen(this.DOMNode)
    }

    // If Portal was open but is now closed fire onClose handler
    if (
      !this.props.open &&
      prevProps.open &&
      typeof this.props.onClose === 'function'
    ) {
      this.props.onClose()
    }
  }

  componentWillUnmount() {
    this.removeNode()

    // If Portal was open fire onClose handler
    if (this.props.open && typeof this.props.onClose === 'function') {
      this.props.onClose()
    }
  }

  render(): React.ReactPortal | null {
    const { children } = this.props

    return this.props.open && React.Children.count(children) > 0
      ? ReactDOM.createPortal(children, this.insertNode())
      : null
  }

  removeNode() {
    if (
      this.DOMNode &&
      this.DOMNode.parentNode &&
      typeof this.DOMNode.parentNode.removeChild === 'function'
    ) {
      this.DOMNode.parentNode.removeChild(this.DOMNode)
      this.DOMNode = null
      // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
      this.props.elementRef(this.DOMNode)
    }
  }

  insertNode() {
    const {
      open,
      insertAt,
      onOpen,
      onClose,
      mountNode,
      children,
      elementRef,
      dir,
      ...props
    } = this.props

    // Create node if it doesn't already exist
    if (!this.DOMNode) {
      const node = document.createElement('span')
      const attributes = {
        ...passthroughProps(props),
        dir
      }

      Object.keys(attributes).forEach((name) => {
        // @ts-expect-error ts-migrate(7053) FIXME: Element implicitly has an 'any' type because expre... Remove this comment to see the full error message
        node.setAttribute(name, attributes[name])
      })

      // @ts-expect-error ts-migrate(2722) FIXME: Cannot invoke an object which is possibly 'undefin... Remove this comment to see the full error message
      elementRef(node)

      this.DOMNode = node
    }

    // Append node to container if it isn't already
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mountNode' does not exist on... Remove this comment to see the full error message
    if (this.DOMNode.parentNode !== this.state.mountNode) {
      if (insertAt === 'bottom') {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'mountNode' does not exist on type 'Reado... Remove this comment to see the full error message
        this.state.mountNode.appendChild(this.DOMNode)
      } else {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'mountNode' does not exist on type 'Reado... Remove this comment to see the full error message
        this.state.mountNode.insertBefore(
          this.DOMNode,
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'mountNode' does not exist on type 'Reado... Remove this comment to see the full error message
          this.state.mountNode.firstChild
        )
      }
    }

    return this.DOMNode
  }

  findMountNode(props: Props) {
    let mountNode

    if (typeof props.mountNode === 'function') {
      mountNode = props.mountNode()
    } else if (props.mountNode) {
      mountNode = props.mountNode
    }

    if (!mountNode || !(mountNode as Element).nodeName) {
      mountNode = document.body
    }

    return mountNode
  }

  get node() {
    return this.DOMNode
  }
}

export default ReactPortal
export { ReactPortal }
