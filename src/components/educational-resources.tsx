
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import Link from "next/link";

const resources = [
  {
    title: "OWASP Top Ten",
    description: "The Open Web Application Security Project's list of the most critical web application security risks.",
    link: "https://owasp.org/www-project-top-ten/",
  },
  {
    title: "Web Security Basics",
    description: "An introduction to web security concepts from Mozilla.",
    link: "https://developer.mozilla.org/en-US/docs/Web/Security",
  },
  {
    title: "Google's Web Fundamentals",
    description: "Learn about security best practices from Google.",
    link: "https://web.dev/explore/security",
  },
  {
    title: "Snyk Learn",
    description: "Free lessons on vulnerabilities and secure coding.",
    link: "https://learn.snyk.io/",
  },
];

export function EducationalResources() {
  return (
    <section id="resources" className="w-full py-12 md:py-24 lg:py-32 bg-card border-t">
      <div className="container px-4 md:px-6  flex flex-col mx-auto">
        <div className="flex flex-col items-center justify-center space-y-4 text-center ">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">Knowledge Base</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Educational Resources</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Learn more about web vulnerabilities and how to protect your applications.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-stretch gap-6 sm:grid-cols-2 md:gap-8 lg:max-w-none lg:grid-cols-4 mt-12">
          {resources.map((resource) => (
            <Card key={resource.title} className="flex flex-col">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 rounded-full bg-accent/10">
                  <BookOpen className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-lg">{resource.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col flex-grow">
                <p className="text-sm text-muted-foreground flex-grow">{resource.description}</p>
                <Link
                  href={resource.link}
                  className="inline-flex items-center text-sm font-medium text-primary hover:underline mt-4"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn More
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
