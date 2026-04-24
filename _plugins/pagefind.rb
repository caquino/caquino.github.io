require 'open3'

# Build the Pagefind search index after Jekyll writes _site.
# Works in both `jekyll serve` (dev) and CI.
# Skip with PAGEFIND_SKIP=1 if you need a fast build.
Jekyll::Hooks.register :site, :post_write do |site|
  next if ENV['PAGEFIND_SKIP']

  dest = site.dest

  # If the binary isn't on PATH (e.g. someone cloned the repo without the
  # dev image), log a warning and continue so the build doesn't fail.
  bin = ENV['PAGEFIND_BIN'] || 'pagefind'
  unless system("which #{bin} > /dev/null 2>&1")
    Jekyll.logger.warn "Pagefind:", "binary not found on PATH, skipping index"
    next
  end

  Jekyll.logger.info "Pagefind:", "indexing #{dest}"
  stdout, stderr, status = Open3.capture3(bin, '--site', dest, '--quiet')
  if status.success?
    Jekyll.logger.info "Pagefind:", "index built"
  else
    Jekyll.logger.warn "Pagefind:", "index build failed: #{stderr.strip}"
  end
end
