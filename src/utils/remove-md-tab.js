export function removeMDTab(md) {
  // Remember old renderer, if overridden, or proxy to default renderer
  let defaultRender = md.renderer.rules.link_open || function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options)
  }

  let prefix = '+tab+'

  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    let hrefIndex = tokens[idx].attrIndex('href')
    let href = tokens[idx].attrs[hrefIndex][1]
    if (prefix === href.slice(0, prefix.length)) {
        // trim prefix if href starts with prefix
      tokens[idx].attrs[hrefIndex][1] = href.slice(prefix.length, href.length)
    }

    // pass token to default renderer
    return defaultRender(tokens, idx, options, env, self)
  };
}
