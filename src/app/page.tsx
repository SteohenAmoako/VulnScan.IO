import { Header } from '@/components/header';
import { ScanForm } from '@/components/scan-form';
import { EducationalResources } from '@/components/educational-resources';
import { Footer } from '@/components/footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section className="py-20 md:py-24 lg:py-32 xl:py-40">
          <div className="container px-4 md:px-6 flex mx-auto ">
            <div className="flex flex-col items-center space-y-6 text-center mx-auto">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">Web Security For Education</div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none font-headline text-primary">
                  VulnScan.IO
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Enter a website URL to scan for security vulnerabilities and receive a comprehensive, educational report.
                </p>
              </div>
              <div className="w-full max-w-lg space-y-2 pt-4">
                <ScanForm />
                <p className="text-xs text-muted-foreground">
                  Powered by AI to provide insights for learning purposes.
                </p>
              </div>
            </div>
          </div>
        </section>
        <EducationalResources />
      </main>
      <Footer />
    </div>
  );
}
