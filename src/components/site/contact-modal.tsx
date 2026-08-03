"use client";

import { useState, ReactElement } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ContactModal({ trigger }: { trigger?: ReactElement }) {
  const [result, setResult] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    setIsSubmitting(true);
    setResult("Sending....");
    
    const formData = new FormData(formElement);
    // Replace this with the actual Web3Forms access key
    formData.append("access_key", "7fbed3cd-648b-4ee1-8299-a99e0adb0576");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setResult("Form Submitted Successfully!");
        formElement.reset();
      } else {
        console.log("Error", data);
        setResult(data.message || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      setResult("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger
        render={
          trigger || (
            <button className="relative group text-primary hover:text-blue-500 transition-colors font-medium py-0.5">
              Contact Us
              <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-blue-500 transition-[width] duration-300 group-hover:w-full"></span>
            </button>
          )
        }
      />
      <DialogContent className="sm:max-w-[425px] overflow-hidden p-0 border-blue-100 shadow-2xl bg-white rounded-xl">
        <div className="bg-gradient-to-br from-blue-50 to-white p-6 pb-5 border-b border-blue-100">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight text-blue-950 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              Get in Touch
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2 text-sm leading-relaxed">
              Have a question about the tournament? Drop us a message or chat with us instantly on WhatsApp.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 pt-4 bg-white">
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name" className="text-blue-950 text-xs uppercase tracking-wider font-semibold">Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  required 
                  placeholder="John Doe" 
                  className="bg-white border-gray-200 focus-visible:ring-blue-600 text-gray-900 placeholder:text-gray-400 transition-shadow shadow-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="mobile" className="text-blue-950 text-xs uppercase tracking-wider font-semibold">Mobile No.</Label>
                <Input 
                  id="mobile" 
                  name="mobile" 
                  type="tel" 
                  required 
                  placeholder="e.g. 9876543210" 
                  className="bg-white border-gray-200 focus-visible:ring-blue-600 text-gray-900 placeholder:text-gray-400 transition-shadow shadow-sm"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="message" className="text-blue-950 text-xs uppercase tracking-wider font-semibold">Message</Label>
              <Textarea 
                id="message" 
                name="message" 
                required 
                placeholder="How can we help you today?" 
                rows={3} 
                className="bg-white border-gray-200 focus-visible:ring-blue-600 text-gray-900 placeholder:text-gray-400 resize-none transition-shadow shadow-sm"
              />
            </div>
            
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md transition-colors duration-300"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Sending...
                </span>
              ) : "Send Message"}
            </Button>
            
            {result && (
              <p className="text-sm text-center font-medium text-blue-600 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {result}
              </p>
            )}
          </form>

          <div className="mt-6 flex flex-col items-center justify-center text-center">
            <div className="w-full flex items-center gap-4 mb-4">
              <div className="h-px flex-1 bg-gray-100"></div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Or</span>
              <div className="h-px flex-1 bg-gray-100"></div>
            </div>
            <a 
              href="https://wa.me/918487832810" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group inline-flex w-full items-center justify-center rounded-lg bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 border border-green-200 shadow-sm transition-colors duration-300 h-11 px-6 font-semibold gap-2.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" className="transition-transform group-hover:scale-110">
                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
