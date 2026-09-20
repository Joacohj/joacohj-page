import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type NewsletterWelcomeEmailProps = {
  unsubscribeUrl: string;
};

export default function NewsletterWelcomeEmail({
  unsubscribeUrl,
}: NewsletterWelcomeEmailProps) {
  return (
    <Html>
      <Head />

      <Preview>
        Welcome to the Joacohj newsletter
      </Preview>

      <Body
        style={{
          backgroundColor: "#fafafa",
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          margin: 0,
          padding: "40px 0",
        }}
      >
        <Container
          style={{
            maxWidth: "560px",
            margin: "0 auto",
            padding: "0 24px",
          }}
        >
          <Heading
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: "#09090b",
              marginBottom: "16px",
            }}
          >
            Welcome to the newsletter 👋
          </Heading>

          <Text
            style={{
              fontSize: "15px",
              lineHeight: "24px",
              color: "#52525b",
            }}
          >
            Thanks for subscribing to the Joacohj newsletter.
            You&apos;ll receive updates about new projects, articles,
            experiments and things I&apos;m building.
          </Text>

          <Section style={{ marginTop: "32px" }}>
            <Button
              href="https://joacohj.dev"
              style={{
                backgroundColor: "#18181b",
                borderRadius: "6px",
                color: "#ffffff",
                fontSize: "14px",
                fontWeight: 500,
                textDecoration: "none",
                padding: "10px 16px",
              }}
            >
              Visit my website
            </Button>
          </Section>

          <Text
            style={{
              fontSize: "12px",
              lineHeight: "18px",
              color: "#71717a",
              marginTop: "40px",
            }}
          >
            You received this email because you subscribed to
            the Joacohj newsletter.
          </Text>

          <Text
            style={{
              fontSize: "12px",
              color: "#71717a",
              marginTop: "8px",
            }}
          >
            If you don&apos;t want to receive these emails anymore,{" "}
            <a
              href={unsubscribeUrl}
              style={{
                color: "#18181b",
                textDecoration: "underline",
              }}
            >
              unsubscribe here
            </a>
            .
          </Text>
        </Container>
      </Body>
    </Html>
  );
}