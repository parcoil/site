import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Mail,
  Github,
  Twitter,
} from "lucide-react";
import AdBanner from "@/components/AdBanner";

export const metadata = {
  title: "Contact | Parcoil",
  description:
    "Get in touch with Parcoil. Send us a message or connect with us on social media.",
  keywords: ["contact", "support", "feedback", "Parcoil"],
};

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Have a question, suggestion, or want to collaborate? We'd love to
            hear from you. Send us a message and we'll get back to you as soon
            as possible.
          </p>
        </div>

        <div className="flex items-center justify-center mx-auto">
          {/* Contact Form */}
          {/* <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Send us a Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action="/api/contact" method="POST" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    name="subject"
                    required
                    placeholder="What's this about?"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    placeholder="Tell us more..."
                    rows={5}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card> */}

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-muted-foreground">hello@parcoil.com</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Github className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">GitHub</p>
                    <a
                      href="https://github.com/parcoil"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      github.com/parcoil
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Twitter className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Twitter</p>
                    <a
                      href="https://twitter.com/parcoilnet"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-2"
                    >
                      @parcoilnet
                      <p className="text-xs">(Not really active)</p>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>FAQ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">
                    How can I contribute to your projects?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Check out our GitHub repositories and look for open issues
                    labeled "good first issue".
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-1">
                    Do you offer custom development services?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Yes! Contact us with details about your project and we'll
                    discuss how we can help.
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-1">
                    Can I suggest new features for parcoil products?
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Absolutely! We love hearing from our users. Use the contact
                    form above to share your ideas.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Response Time</h3>
                <p className="text-sm text-muted-foreground">
                  We typically respond to messages within 24-48 hours. For
                  urgent matters, please mention it in your message.
                </p>
              </CardContent>
            </Card>
         </div>

         <div className="max-w-4xl mx-auto px-4 py-8">
           <AdBanner />
         </div>
       </div>
     </div>
    </div>
  );
}
