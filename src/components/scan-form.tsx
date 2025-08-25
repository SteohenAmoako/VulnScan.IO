
'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Search } from 'lucide-react';
import { useState } from 'react';

const formSchema = z.object({
  url: z.string().superRefine((value, ctx) => {
    if (!value || value.trim() === "") {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Please enter a URL to scan.",
        });
        return;
    }

    // Check for invalid protocols
    if (value.includes('://') && !/^(https|http):\/\//.test(value)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid protocol. URL must start with http:// or https://",
        });
        return;
    }
    
    // Attempt to parse the URL
    try {
        const urlToValidate = /^(http|https):\/\//.test(value) ? value : `http://${value}`;
        const url = new URL(urlToValidate);

        // A basic check to ensure hostname has at least a TLD
        if (!url.hostname || !url.hostname.includes('.')) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Invalid domain name. Please enter a valid URL.",
            });
        }
    } catch (_) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "The URL is malformed. Please check for typos.",
        });
    }
  })
});

export function ScanForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
    },
    mode: 'onBlur' // Validate on blur for better user experience
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    let submissionUrl = values.url;
    if (!/^(http|https):\/\//.test(submissionUrl)) {
        submissionUrl = `http://${submissionUrl}`;
    }
    const encodedUrl = encodeURIComponent(submissionUrl);
    router.push(`/scan?url=${encodedUrl}`);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row gap-2">
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormControl>
                <Input placeholder="example.com" {...field} aria-label="Website URL" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto min-w-[120px]">
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" /> Scan
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
