"use client";

import * as React from "react";
import { Button } from "@/registry/new-york/ui/button";
import { Badge } from "@/registry/new-york/ui/badge";
import { Input } from "@/registry/new-york/ui/input";
import { Label } from "@/registry/new-york/ui/label";
import { Checkbox } from "@/registry/new-york/ui/checkbox";
import { Switch } from "@/registry/new-york/ui/switch";
import { Textarea } from "@/registry/new-york/ui/textarea";
import { Slider } from "@/registry/new-york/ui/slider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/registry/new-york/ui/card";
import { Avatar, AvatarFallback } from "@/registry/new-york/ui/avatar";
import { Progress } from "@/registry/new-york/ui/progress";
import { Skeleton } from "@/registry/new-york/ui/skeleton";
import { Separator } from "@/registry/new-york/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/registry/new-york/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/registry/new-york/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/registry/new-york/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/registry/new-york/ui/table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/registry/new-york/ui/breadcrumb";
import { AlertCircle, CheckCircle2, Info, Home, ChevronRight } from "lucide-react";

type PreviewCategory = "form" | "overlay" | "navigation" | "display" | "feedback";

const PREVIEW_CATEGORIES: { id: PreviewCategory; label: string }[] = [
  { id: "form", label: "Form" },
  { id: "overlay", label: "Overlay" },
  { id: "navigation", label: "Navigation" },
  { id: "display", label: "Display" },
  { id: "feedback", label: "Feedback" },
];

function FormPreview() {
  const [sliderVal, setSliderVal] = React.useState([50]);
  const [checked, setChecked] = React.useState(false);
  const [switched, setSwitched] = React.useState(false);

  return (
    <div className="space-y-6">
      {/* Buttons */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Buttons</h3>
        <div className="flex flex-wrap gap-2">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button disabled>Disabled</Button>
        </div>
      </div>

      <Separator />

      {/* Input + Label */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Input</h3>
        <div className="space-y-3 max-w-sm">
          <div className="space-y-1.5">
            <Label htmlFor="email-preview">Email address</Label>
            <Input id="email-preview" type="email" placeholder="you@example.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="textarea-preview">Message</Label>
            <Textarea id="textarea-preview" placeholder="Type your message here..." rows={3} />
          </div>
        </div>
      </div>

      <Separator />

      {/* Checkbox & Switch */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Controls</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="check-preview"
              checked={checked}
              onCheckedChange={(v) => setChecked(v === true)}
            />
            <Label htmlFor="check-preview">Accept terms and conditions</Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="switch-preview"
              checked={switched}
              onCheckedChange={setSwitched}
            />
            <Label htmlFor="switch-preview">Enable notifications</Label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Slider */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Slider</h3>
        <div className="max-w-sm">
          <Slider
            value={sliderVal}
            onValueChange={setSliderVal}
            min={0}
            max={100}
            step={1}
            className="mb-2"
          />
          <p className="text-xs text-muted-foreground">Value: {sliderVal[0]}</p>
        </div>
      </div>
    </div>
  );
}

function OverlayPreview() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Tooltip Hint</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Interactive overlays (Dialog, Dropdown, Popover, Sheet, Tooltip) require user interaction.
          Below is a static representation.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3">
            <p className="text-xs font-medium mb-2">Dialog</p>
            <div className="bg-muted rounded-md p-3 text-xs text-muted-foreground border border-border">
              <p className="font-medium text-foreground mb-1">Modal Title</p>
              <p>Modal content area with actions below.</p>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline">Cancel</Button>
                <Button size="sm">Confirm</Button>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <p className="text-xs font-medium mb-2">Dropdown</p>
            <div className="bg-popover rounded-md p-1 border border-border shadow-md text-xs w-full">
              {["Profile", "Settings", "Help", "Sign out"].map((item, i) => (
                <div
                  key={item}
                  className={`px-2 py-1.5 rounded hover:bg-accent cursor-default ${i === 3 ? "text-destructive" : ""}`}
                >
                  {item}
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-3">
            <p className="text-xs font-medium mb-2">Popover</p>
            <div className="bg-popover rounded-md p-3 border border-border shadow-md text-xs">
              <p className="font-medium text-foreground mb-1">Popover</p>
              <p className="text-muted-foreground">Quick info panel content.</p>
            </div>
          </Card>
          <Card className="p-3">
            <p className="text-xs font-medium mb-2">Tooltip</p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">Hover me</Button>
              <div className="bg-foreground text-background text-xs px-2 py-1 rounded">
                Tooltip text
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function NavigationPreview() {
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Breadcrumb</h3>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">
                <Home className="w-3.5 h-3.5" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">Components</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Separator />

      {/* Tabs */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Tabs</h3>
        <Tabs defaultValue="account">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="account" className="mt-3">
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Manage your account settings.</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
          <TabsContent value="password" className="mt-3">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Change your password here.</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
          <TabsContent value="settings" className="mt-3">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Manage your preferences.</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Separator />

      {/* Pagination */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Pagination</h3>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline">Previous</Button>
          {[1, 2, 3, 4, 5].map((page) => (
            <Button key={page} size="sm" variant={page === 2 ? "default" : "outline"} className="w-8 px-0">
              {page}
            </Button>
          ))}
          <Button size="sm" variant="outline">Next</Button>
        </div>
      </div>
    </div>
  );
}

function DisplayPreview() {
  return (
    <div className="space-y-6">
      {/* Cards & Badges */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Card & Badges</h3>
        <Card className="max-w-sm">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">John Doe</CardTitle>
                  <CardDescription>Software Engineer</CardDescription>
                </div>
              </div>
              <Badge>Active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Building great products with great teams.</p>
            <div className="flex gap-1.5 mt-3">
              <Badge variant="secondary">React</Badge>
              <Badge variant="secondary">TypeScript</Badge>
              <Badge variant="outline">Design</Badge>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1">Message</Button>
            <Button size="sm" className="flex-1">Follow</Button>
          </CardFooter>
        </Card>
      </div>

      <Separator />

      {/* Table */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Table</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { name: "Alice Kim", role: "Designer", status: "Active" },
              { name: "Bob Lee", role: "Developer", status: "Away" },
              { name: "Carol Wang", role: "Manager", status: "Active" },
            ].map((row) => (
              <TableRow key={row.name}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.role}</TableCell>
                <TableCell>
                  <Badge variant={row.status === "Active" ? "default" : "secondary"}>
                    {row.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Separator />

      {/* Accordion */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Accordion</h3>
        <Accordion type="single" collapsible className="max-w-sm">
          <AccordionItem value="item-1">
            <AccordionTrigger>What is DesignSync?</AccordionTrigger>
            <AccordionContent>
              DesignSync is a visual design token editor that lets you customize your design system in real-time.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>How does it work?</AccordionTrigger>
            <AccordionContent>
              Edit tokens on the left panel and see changes reflected instantly in this preview.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <Separator />

      {/* Progress & Skeleton */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Progress & Skeleton</h3>
        <div className="space-y-3 max-w-sm">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Upload progress</span>
              <span>68%</span>
            </div>
            <Progress value={68} />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedbackPreview() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground mb-3">Alerts</h3>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          Your account has been successfully updated with the new settings.
        </AlertDescription>
      </Alert>

      <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertTitle className="text-green-800 dark:text-green-200">Success</AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-300">
          Your changes have been saved and deployed successfully.
        </AlertDescription>
      </Alert>

      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to connect to the server. Please check your network connection.
        </AlertDescription>
      </Alert>

      <Separator />

      <h3 className="text-sm font-medium text-foreground mb-3">Toast Simulation</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-3 bg-foreground text-background px-4 py-3 rounded-md shadow-lg max-w-sm">
          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">Saved successfully</p>
            <p className="text-xs opacity-70">Your design tokens have been updated.</p>
          </div>
          <button className="text-xs opacity-50 hover:opacity-100">×</button>
        </div>
        <div className="flex items-center gap-3 bg-destructive text-white px-4 py-3 rounded-md shadow-lg max-w-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">Deploy failed</p>
            <p className="text-xs opacity-70">Check your API credentials and try again.</p>
          </div>
          <button className="text-xs opacity-50 hover:opacity-100">×</button>
        </div>
      </div>
    </div>
  );
}

export function PreviewPanel() {
  const [category, setCategory] = React.useState<PreviewCategory>("form");

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-background">
      {/* Category tabs */}
      <div className="border-b border-border bg-card flex items-center px-4 gap-1 flex-shrink-0 overflow-x-auto">
        {PREVIEW_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className={`px-3 py-2.5 text-xs whitespace-nowrap transition-colors ${
              category === cat.id
                ? "border-b-2 border-primary text-primary font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Preview content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          {category === "form" && <FormPreview />}
          {category === "overlay" && <OverlayPreview />}
          {category === "navigation" && <NavigationPreview />}
          {category === "display" && <DisplayPreview />}
          {category === "feedback" && <FeedbackPreview />}
        </div>
      </div>
    </div>
  );
}
