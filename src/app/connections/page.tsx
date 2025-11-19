"use client";
import docsIcon from "@/assets/icons/docs.png";
import excelIcon from "@/assets/icons/excel.png";
import sheetsIcon from "@/assets/icons/sheets.png";
import driveIcon from "@/assets/icons/google-drive.png";
import dropboxIcon from "@/assets/icons/dropbox.png";
import slackIcon from "@/assets/icons/slack.png";
import databaseIcon from "@/assets/icons/database.png";
import jiraIcon from "@/assets/icons/jira.png";
import folderIcon from "@/assets/icons/open-folder.png";
import githubIcon from "@/assets/icons/github-sign.png";
import teamsIcon from "@/assets/icons/teams.png";
import pdfIcon from "@/assets/icons/pdf.png";
import officeIcon from "@/assets/icons/office.png";
import notionIcon from "@/assets/icons/notion.png";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import FileUpload06 from "@/components/file-upload-06";

const ICONS = {
  docs: docsIcon.src,
  excel: excelIcon.src,
  sheets: sheetsIcon.src,
  drive: driveIcon.src,
  drop: dropboxIcon.src,
  slack: slackIcon.src,
  data: databaseIcon.src,
  jira: jiraIcon.src,
  github: githubIcon.src,
  folder: folderIcon.src,
  teams: teamsIcon.src,
  pdf: pdfIcon.src,
  office: officeIcon.src,
  notion: notionIcon.src,
} as const;

const Data = [
  {
    id: 1,
    icons: ["drive", "sheets", "docs"],
    title: "Google Drive",
    description:
      "Connect to Google Drive to search, analyze, and query Sheets and Docs for instant insights.",
    isConnected: false,
    isAvailable: true,
  },
  {
    id: 2,
    icons: ["office", "excel", "word"],
    title: "Microsoft Office",
    description:
      "Integrate Excel and Word to query documents and analyze spreadsheets directly.",
    isConnected: false,
    isAvailable: false,
  },
  {
    id: 3,
    icons: ["data"],
    title: "Tally",
    description:
      "Sync Tally data for financial reports, analytics, and business intelligence.",
    isConnected: false,
    isAvailable: false,
  },
  {
    id: 4,
    icons: ["notion"],
    title: "Notion",
    description:
      "Search and query your Notion pages and databases for organized insights.",
    isConnected: false,
    isAvailable: false,
  },
  {
    id: 5,
    icons: ["drop"],
    title: "Dropbox",
    description:
      "Access, search, and analyze files stored in your Dropbox seamlessly.",
    isConnected: false,
    isAvailable: false,
  },
  {
    id: 6,
    icons: ["slack"],
    title: "Slack",
    description:
      "Query Slack conversations and shared files to surface knowledge instantly.",
    isConnected: false,
    isAvailable: false,
  },
  {
    id: 7,
    icons: ["teams"],
    title: "Microsoft Teams",
    description:
      "Connect Teams chats and files to uncover collaboration insights.",
    isConnected: false,
    isAvailable: false,
  },
  {
    id: 8,
    icons: ["github"],
    title: "GitHub",
    description:
      "Search repositories, issues, and documentation for fast developer insights.",
    isConnected: false,
    isAvailable: false,
  },
  {
    id: 9,
    icons: ["jira"],
    title: "Jira",
    description:
      "Integrate Jira to analyze tasks, sprints, and project management data.",
    isConnected: false,
    isAvailable: false,
  },
  {
    id: 10,
    icons: ["data"],
    title: "Database",
    description:
      "More databases coming soon. Contact support to request your preferred database.",
    isConnected: false,
    isAvailable: false,
  },
];

export default function Database() {
  return (
    <div>
      <div className="flex flex-1 flex-col gap-6 lg:gap-6 p-4 pt-0">
        {/* Scrollable container for all cards */}
        <div className="sm:max-h-none overflow-x-auto overflow-y-hidden sm:overflow-visible pr-2 bg-[#18181B] border border-[#2a2a2a] rounded-xl p-6">
          <h1 className="text-primary font-medium text-xl mb-4">Connect Databases</h1>
          <div className="grid grid-flow-col auto-cols-[minmax(220px,1fr)] grid-rows-2 gap-6 sm:grid-flow-row sm:auto-cols-auto sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:auto-rows-fr">
            {Data.map((item) => {
              const iconKeys = item.icons || [];
              const iconSrcs = iconKeys.map((key) => (ICONS as Record<string, string>)[key] || ICONS.data);

              return (
                <div
                  key={item.id}
                  className="relative flex h-full min-h-[200px] flex-col items-start rounded-xl border border-[#2f2e2e] bg-[#232323] p-6 pb-6 sm:pb-20 shadow-sm transition hover:shadow-md"
                >
                  <div className="mb-4 flex h-10 items-center justify-center gap-2 rounded-md bg-[#363535] px-2">
                    {iconSrcs.map((src, idx) => (
                      <Image key={idx} src={src} alt={item.title} width={24} height={24} className="h-6 w-6 object-contain" />
                    ))}
                  </div>
                  <div className="mb-1 text-base font-medium">{item.title}</div>
                  <div className="text-xs leading-snug text-muted-foreground text-left">{item.description}</div>


                  <Button
                    className={`bg-[#FF7D0B] text-black rounded-md ml-auto mt-4 w-full sm:w-auto sm:absolute sm:bottom-4 sm:right-4 px-3 py-2 shadow-sm hover:bg-[#cc5f00] hover:text-black`}
                    disabled={item.title !== "Google Drive"}
                  >
                    {item.title !== "Google Drive" ? "Coming Soon" : item.isConnected ? "Add Files" : "Connect"}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Your files (static placeholder) */}
        <div className="sm:max-h-none overflow-x-auto sm:overflow-visible pr-2 bg-[#18181B] border border-[#2a2a2a] rounded-xl p-6">
          <h1 className="text-primary font-medium text-xl mb-4">Your Files</h1>
          <div className="text-sm text-muted-foreground">No files added yet.</div>
        </div>

        {/* upload file section (static) */}
        <div className="pr-2 bg-[#18181B] border border-[#2a2a2a] rounded-xl md:min-h-min p-6">
          <h1 className="text-primary font-medium text-xl mb-4">Upload Files to Folder</h1>
          <FileUpload06 />
        </div>
      </div>
    </div>
  );
}
