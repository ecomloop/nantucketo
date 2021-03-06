const _ = require('lodash')
const path = require('path')
const { createFilePath } = require('gatsby-source-filesystem')
const { fmImagesToRelative } = require('gatsby-remark-relative-images')

exports.createPages = ({ actions, graphql }) => {
  const { createPage } = actions

  return graphql(`
    {
      allMarkdownRemark(limit: 1000) {
        edges {
          node {
            id
            frontmatter {
              template
              title
            }
            fields {
              slug
              contentType
            }
          }
        }
      }
    }
  `).then(result => {
    if (result.errors) {
      result.errors.forEach(e => console.error(e.toString()))
      return Promise.reject(result.errors)
    }

    const mdFiles = result.data.allMarkdownRemark.edges

    const contentTypes = _.groupBy(mdFiles, 'node.fields.contentType')

    _.each(contentTypes, (pages, contentType) => {
      // skipping for contentType='posts' as they would be coming from googlesheets
      if(contentType=='posts') return;

      const pagesToCreate = pages.filter(page =>
        // skipping for 'blog' page as it would be creating by blog.js in pages directory
        (page.node.fields.slug!='/blog/') &&
        // get pages with template field
        _.get(page, `node.frontmatter.template`)
      )
      if (!pagesToCreate.length) return console.log(`Skipping ${contentType}`)

      console.log(`Creating ${pagesToCreate.length} ${contentType}`)

      pagesToCreate.forEach((page, index) => {
        const id = page.node.id
        createPage({
          // page slug set in md frontmatter
          path: page.node.fields.slug,
          component: path.resolve(
            `src/templates/${String(page.node.frontmatter.template)}.js`
          ),
          // additional data can be passed via context
          context: {
            id,
          },
        })
      })
    })

    //Creating Shopify Product Pages
    return graphql(`
      {
        allShopifyProduct {
          edges {
            node {
              handle
            }
          }
        }
      }
    `).then(result => {
      result.data.allShopifyProduct.edges.forEach(({ node }) => {
        createPage({
          path: `/product/${node.handle}/`,
          component: path.resolve(`./src/templates/ProductPage.js`),
          context: {
            // Data passed to context is available
            // in page queries as GraphQL variables.
            handle: node.handle,
          },
        })
      })

      //Start of creating pages from Google Sheet Data
      return graphql(`
      {
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
      `).then(result => {
        result.data.allGoogleSheetLinksRow.edges.forEach(({ node }) => {
          createPage({
            path: `/blog/${node.articleid}/`,
            component: path.resolve(`./src/templates/SingleBlog.js`),
            context: {
              // Data passed to context is available
              // in page queries as GraphQL variables.
              blogid: node.articleid,
            },
          })
        })
      })//end of google sheet page creation
    })// end of shopify page creation
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  // convert frontmatter images
  fmImagesToRelative(node)

  // Create smart slugs
  // https://github.com/Vagr9K/gatsby-advanced-starter/blob/master/gatsby-node.js
  let slug
  if (node.internal.type === 'MarkdownRemark') {
    const fileNode = getNode(node.parent)
    const parsedFilePath = path.parse(fileNode.relativePath)

    if (_.get(node, 'frontmatter.slug')) {
      slug = `/${node.frontmatter.slug.toLowerCase()}/`
    } else if (
      // home page gets root slug
      parsedFilePath.name === 'home' &&
      parsedFilePath.dir === 'pages'
    ) {
      slug = `/`
    } else if (_.get(node, 'frontmatter.title')) {
      slug = `/${_.kebabCase(parsedFilePath.dir)}/${_.kebabCase(
        node.frontmatter.title
      )}/`
    } else if (parsedFilePath.dir === '') {
      slug = `/${parsedFilePath.name}/`
    } else {
      slug = `/${parsedFilePath.dir}/`
    }

    createNodeField({
      node,
      name: 'slug',
      value: slug,
    })

    // Add contentType to node.fields
    createNodeField({
      node,
      name: 'contentType',
      value: parsedFilePath.dir,
    })
  }
}

// Random fix for https://github.com/gatsbyjs/gatsby/issues/5700
module.exports.resolvableExtensions = () => ['.json']
