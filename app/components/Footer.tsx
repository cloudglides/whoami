import Image from "next/image";

export default function Footer() {
  return (
    <footer>
      <div className="footer-accent" />
      <div className="border-t border-govuk-border bg-govuk-grey-1">
        <div className="mx-auto max-w-5xl px-5 py-6">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="font-hc text-2xl text-hc">hackclub</p>
              <p className="mt-1 text-xs text-govuk-text-muted">
                A Hackclub YSWS.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://hackclub.com"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-60"
              >
                <img
                  src="https://assets.hackclub.com/flag-orpheus-top.svg"
                  alt="Hackclub"
                  width="32"
                  height="32"
                  className="block grayscale opacity-30"
                />
              </a>
              <a
                href="https://app.slack.com/client/E09V59WQY1E/C0BM1L56D19"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-60"
              >
                <img
                  src="https://icon-files.lineicons.com/cdn/free/brands-logos/rounded/outlined/slack.png"
                  alt="Slack"
                  width="32"
                  height="32"
                  className="block grayscale opacity-30"
                />
              </a>
            </div>
          </div>
          <div className="mt-4 border-t border-govuk-border pt-3">
            <p className="text-xs text-govuk-text-muted">
              All content is available under the{" "}
              <a
                href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-govuk-blue underline"
              >
                Open Government Licence v3.0
              </a>
              , except where otherwise stated.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Image
                src="/crown-copyright.png"
                alt="Crown copyright"
                width={48}
                height={48}
                className="block opacity-40"
              />
              <span className="text-xs text-govuk-text-muted">
                &copy; Crown copyright
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
