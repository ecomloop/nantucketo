import React, { Fragment } from 'react'
import _get from 'lodash/get'
import { Link, graphql } from 'gatsby'
import { ChevronLeft } from 'react-feather'

import PageHeader from '../components/PageHeader'
import Content from '../components/Content'
import Layout from '../components/Layout'
import './SinglePost.css'

// Export Default SinglePost for front-end
const SingleBlog = ({ data: { post } }) => {
  return (
    <Layout
      meta={post.meta || false}
      title={post.title || false}
    >
      <main>
        <PageHeader title={post.title} backgroundImage={'https://source.unsplash.com/1600x900/?abstract.' + post.articleid} />
        <article
          className="SinglePost section light"
          itemScope
          itemType="http://schema.org/BlogPosting"
        >
          <div className="container skinny">
            <Link className="SinglePost--BackButton" to="/blog/">
              <ChevronLeft /> BACK
          </Link>
            <div className="SinglePost--Content relative">
              <div className="SinglePost--Meta">
                {post.dateadded}
              </div>

              {post.title && (
                <h1 className="SinglePost--Title" itemProp="title">
                  {post.title}
                </h1>
              )}

              {post.image && (
                <div className="SinglePost--InnerContent">
                  <img src={post.image} title={post.title} width="100%" />
                </div>
              )}

              <div className="SinglePost--InnerContent">
                <Content source={post.text} />
              </div>

              <div className="SinglePost--InnerContent">
                {post.author && post.source &&
                  <div>From {post.author} at {post.source}</div>
                }
                {post.publishdate &&
                  <div>Originally published {post.publishdate}</div>
                }
              </div>
              <div className="SinglePost--InnerContent">
                <blockquote>{post.highlight}</blockquote>
              </div>

              <div className="SinglePost--InnerContent">
                <blockquote>{post.highlight2}</blockquote>
              </div>

              <div className="SinglePost--Pagination">
                <a href={post.url} target="_blank" className="Nav--CTA animated jello fadeInDown delay-2s">Read the original post &gt;</a>
              </div>

            </div>
          </div>
        </article>
      </main>
    </Layout>
  )
}

export default SingleBlog

export const pageQuery = graphql`
  query SingleBlog($blogid: Int!) {
    post: googleSheetLinksRow(articleid: {eq: $blogid}) {
      articleid
      author
      comment
      dateadded(formatString: "dddd MMM DD, YYYY")
      excerpt
      highlight
      highlight2
      id
      image
      images
      popularity
      publishdate
      relativepopularity
      source
      source2
      tags
      text
      title
      url
    }
    
  }
`
