/**
 * Implement Gatsby's Node APIs in this file.
 * @2019/01/30
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

const fs = require('fs-extra')
const path = require('path')
const { createFilePath } = require('gatsby-source-filesystem')
const { fmImagesToRelative } = require('gatsby-remark-relative-images')



// 0. add public directory clean @2019/01/18, 05/20
exports.onPreInit = () => {
  console.log('>>>> ult pre build...');
  let folder = './public';
  // REPLACEMENT: $ gatsby clean
  // fs.emptyDirSync(folder);
}


// 1. create node first
exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions
  fmImagesToRelative(node) // convert image paths for gatsby images

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      node,
      name: `slug`,
      value,
    })
  }
}

// 2. then create pages by template & .md content
exports.createPages = async ({ graphql, actions }) => {
  
  const { createPage } = actions
  const categoryTplt = path.resolve(`src/templates/category.js`)
  const tutorialTplt = path.resolve(`src/templates/tutorial.js`)
  const quizTplt     = path.resolve(`src/templates/quiz.js`)
  const markdowns = `{
    pages: allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      limit: 1000
    ) {
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            template
          }
        }
      }
    }
  }`
  
  try {
    console.log('>>> start query markdowns...')
    const result = await graphql(markdowns)
    console.log('>>> start generate pages...')
    // Create site pages by .md file
    const pages = result.data.pages.edges;

    pages.forEach((page, index) => {

      const { slug } = page.node.fields
      // add template reference in main page @2019/04/17
      const { template } = page.node.frontmatter

      // console.log(slug)

      if(/\/category\/[\w-]+\/$/.test(slug)){// create `category` by index.md
        // console.log('>>> create category index.md: ', slug)
        createPage({
          path: slug,
          component: categoryTplt,
          context: {slug}
        })
        return
      }

      // MUST:  placed BEFORE the tutorial section creation
      if(/\/category\/([\w-]+\/){2}test\//.test(slug)){// create `quiz` page
        const tutpath = slug.match(/\/category\/([\w-]+\/){2}/g)[0]
        const catpath = slug.match(/\/category\/([\w-]+\/){1}/g)[0]
        // console.log('>>> create quiz page ...', slug)
        createPage({
          path: slug,
          component: quizTplt,
          context: {slug, tutpath, catpath}
        })
        return
      }

      if(/\/category\/([\w-]+\/){3}/.test(slug)){// create `tutorial` section
        const tutpath = slug.match(/\/category\/([\w-]+\/){2}/g)[0]
        const catpath = slug.match(/\/category\/([\w-]+\/){1}/g)[0]
        const quizpath= tutpath+'test/'
        // console.log('>>> create tutorial section: ', tutpath)
        createPage({
          path: slug,
          component: tutorialTplt,
          context: {slug, tutpath, catpath, quizpath}
        })
        return
      }

      // Last: to generate page of navi bar menu!
      createPage({
        path: slug,
        component: path.resolve(
          // one on one mapping!
          // `src/templates${String(slug).slice(0, -1)}.js`
          template ? template : 'src/templates/post.js'
        ),
        // Data passed to context is available
        // in page queries as GraphQL variables.
        // also available in props.pageContext of component
        context: {
          slug: slug,
        },
      })

    // end of pages loop
    });
  } catch (error) {
    console.error(error);
  }
// end of createPages
}
