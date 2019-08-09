/**
 * PostsFilter filters an array of posts by tags and number of posts
 * to provide for a component
 * 
 * props include:
 *   settings: Object {
 *     maxPosts: Integer - The maximum number of posts to render in the passed component
 *     postTags: Array [String - Any accepted tags to use in the passed component]
 *     strictTags: Array [String - Any required tags to use in the passed component]
 *     ordered: Boolean - whether or not to use the ordered tags to order the posts
 *   }
 *   posts: Array [Object - Any posts to run through the filter]
 *   component: Component/Function - The component to pass the filtered posts to as this.props.posts
 *   componentProps: Object - Any props required for the passed component
 *   singular: Boolean - whether or not the child component expects the "posts" prop or "post"
 */


import React, { Component } from 'react'

class PostsFilter extends Component {

  constructor(props) {

    super(props)

    let posts = []
    let numberPosts = 0
    const { maxPosts, postTags, strictTags, ordered } = props.settings

    // Filter posts by postTags and maxPosts
    if (!!postTags && postTags.length > 0) {
      posts = props.posts.filter(post => {
        let included = false

        if (
          typeof postTags === 'string' &&
          post.tags.includes(postTags) &&
          numberPosts < maxPosts
        ) {
          included = true
        } else {

          for (const tag of postTags) {

            if (post.tags.includes(tag) && numberPosts < maxPosts) {
              included = true
            }
            
            if (strictTags && !post.tags.includes(tag)) {
              included = false
              break
            }
          }
        }

        if (included) { numberPosts++ }
        return included
      })

    } else {
      if (!postTags && !!maxPosts) {
        posts = props.posts.filter(post => {
          if (numberPosts < maxPosts) {
            numberPosts++
            return true
          } else {
            return false
          }
        })
      } else {
        posts = props.posts
      }
    }

    if (ordered) {

      const orderedPosts = []
      const unorderedPosts = []

      for (const post of posts) {
        let found = false

        for (const tag of post.tags) {
          if (tag.includes('order-')) {
            // use index of a tag such as order-2 to be index 2
            orderedPosts[parseInt(tag.split('-')[1])] = post
            found = true
            break
          }
        }

        if (found) {
          continue
        } else {
          unorderedPosts.push(post)
        }
      }

      posts = [...orderedPosts, ...unorderedPosts].filter(post => !!post)
    }

    this.state = { posts }
  }


  render() {

    if (this.props.singular) {
      return (
        <this.props.component
          post={this.state.posts[0]}
          {...this.props.componentProps}
        />
      )
    }

    return (
      <this.props.component
        posts={this.state.posts}
        {...this.props.componentProps}
      />
    )
  }
}


export default PostsFilter
