# Generate OG social-card PNGs by compositing each post's cover.svg into the
# shared lower-third template at _svg/og-template.svg, then rasterising with
# rsvg-convert.
#
# Everything gets inlined into a single self-contained SVG (cover content
# injected as nested <svg>, avatar embedded as a data URI) so rsvg-convert
# never has to follow external references — that path is blocked by default
# and --unlimited is not always enough on hardened librsvg builds.
#
# Runs on `jekyll build` and `jekyll serve` via :site, :post_write, so dev
# previews and production builds produce the same cover.png.
#
# Requires rsvg-convert on PATH (Dockerfile installs librsvg2-bin; the
# GitHub Actions workflow does the same before `jekyll build`).

require 'base64'
require 'fileutils'
require 'tempfile'

module Jekyll
  class OgCardGenerator
    TEMPLATE_PATH = '_svg/og-template.svg'
    AVATAR_PATH   = 'images/avatar.jpg'
    OUT_WIDTH     = 1200
    OUT_HEIGHT    = 630

    def self.generate(site)
      template_file = File.join(site.source, TEMPLATE_PATH)
      avatar_file   = File.join(site.source, AVATAR_PATH)
      unless File.exist?(template_file) && File.exist?(avatar_file)
        Jekyll.logger.warn 'OG cards:', "template or avatar missing — skipping"
        return
      end
      unless system('which', 'rsvg-convert', out: File::NULL, err: File::NULL)
        Jekyll.logger.warn 'OG cards:', 'rsvg-convert not on PATH — skipping PNG render'
        return
      end

      template         = File.read(template_file)
      avatar_data_uri  = 'data:image/jpeg;base64,' + Base64.strict_encode64(File.binread(avatar_file))
      rendered         = 0

      site.posts.docs.each do |post|
        cover = post.data['cover']
        next unless cover.to_s.end_with?('.svg')

        src_svg = File.join(site.source, cover.sub(%r{\A/}, ''))
        next unless File.exist?(src_svg)

        inner = extract_svg_inner(File.read(src_svg))
        next if inner.nil?

        composite = template
                      .sub('%%COVER%%',  inner)
                      .sub('%%AVATAR%%', avatar_data_uri)

        dest_dir = File.join(site.dest, File.dirname(cover))
        FileUtils.mkdir_p(dest_dir)
        dest_png = File.join(dest_dir, 'cover.png')

        Tempfile.create(['og-card-', '.svg']) do |tmp|
          tmp.write(composite)
          tmp.flush
          ok = system('rsvg-convert',
                      '-w', OUT_WIDTH.to_s, '-h', OUT_HEIGHT.to_s,
                      tmp.path, '-o', dest_png,
                      out: File::NULL, err: File::NULL)
          if ok
            rendered += 1
          else
            Jekyll.logger.warn 'OG cards:', "rsvg-convert failed for #{post.data['slug']}"
          end
        end
      end

      Jekyll.logger.info 'OG cards:', "rendered #{rendered} cover.png files from _svg/og-template.svg"
    end

    # Strip the outer <svg ...>...</svg> tags, leaving the interior elements.
    def self.extract_svg_inner(svg_text)
      m = svg_text.match(/<svg\b[^>]*>(.*)<\/svg>\s*\z/m)
      m ? m[1] : nil
    end
  end
end

Jekyll::Hooks.register :site, :post_write do |site|
  Jekyll::OgCardGenerator.generate(site)
end
