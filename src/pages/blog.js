import React from 'react'
import { graphql } from 'gatsby'
import Layout from '../components/Layout'
import PageHeader from '../components/PageHeader'
import PostSection from '../components/PostSection'

const BlogIndexPage = ({ data: { allGoogleSheetLinksRow } }) => {
  const allPosts = allGoogleSheetLinksRow.edges.map(post => ({
    ...post.node,
    slug: `/blog/${post.node.articleid}/`,
    date: post.node.dateadded,
    featuredImage: 'https://source.unsplash.com/1600x900/?abstract.'+ post.node.articleid,
  }))

  return (
    <Layout title="a Nantucket shop" description="a nantucket store & blog for nantucketers everywhere">
      <PageHeader
        title="Blog Posts"
        subtitle="See all posts"
        backgroundImage="../images/headless_hero.jpg"
      />
      <section className="section">
        <div className="container">
          <PostSection title="Recent Blog Posts" posts={allPosts} />
        </div>
      </section>
    </Layout>
  )
}

export default BlogIndexPage

export const pageQuery = graphql`
  query BlogIndexPage {
    allGoogleSheetLinksRow(sort: {fields: dateadded, order: DESC}) {
      edges {
        node {
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
    }
  }

`;