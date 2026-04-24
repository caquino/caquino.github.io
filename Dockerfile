FROM ruby:3.3-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends build-essential git curl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Pagefind static-site search index. The Jekyll post_write hook in
# _plugins/pagefind.rb runs this after each build, so dev previews
# include a working search.
ARG PAGEFIND_VERSION=1.5.2
RUN arch=$(uname -m) \
  && case "$arch" in \
        x86_64)  url="https://github.com/CloudCannon/pagefind/releases/download/v${PAGEFIND_VERSION}/pagefind-v${PAGEFIND_VERSION}-x86_64-unknown-linux-musl.tar.gz" ;; \
        aarch64) url="https://github.com/CloudCannon/pagefind/releases/download/v${PAGEFIND_VERSION}/pagefind-v${PAGEFIND_VERSION}-aarch64-unknown-linux-musl.tar.gz" ;; \
        *)       echo "unsupported arch: $arch" >&2; exit 1 ;; \
     esac \
  && curl -sSL -o /tmp/pagefind.tar.gz "$url" \
  && tar -xzf /tmp/pagefind.tar.gz -C /usr/local/bin \
  && rm /tmp/pagefind.tar.gz \
  && pagefind --version

WORKDIR /site

ENV BUNDLE_PATH=/bundle \
    BUNDLE_BIN=/bundle/bin \
    PATH=/bundle/bin:$PATH \
    JEKYLL_ENV=development

RUN gem install bundler -N

EXPOSE 4000

CMD ["sh", "-c", "bundle install && exec bundle exec jekyll serve --host 0.0.0.0 --port 4000 --incremental --force_polling --config _config.yml,_config.dev.yml"]
