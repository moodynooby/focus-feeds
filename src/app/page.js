"use client";

import { useState, useEffect } from "react";
import { fetchFeeds } from "./actions";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import * as React from "react";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import Button from "@mui/material/Button";
import Input from "@mui/material/Input";
import { usePersistedUrls } from "../hooks/storage";
import DeleteIcon from "@mui/icons-material/Delete";
export default function FeedManager() {
  const [value, setValue] = React.useState("1");

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  // 1. Manage your list of links here
  const [urls, setUrls] = usePersistedUrls([
    "https://hnrss.org/frontpage",
    "https://www.theverge.com/rss/index.xml",
  ]); // Handler to remove a link
  const handleRemove = (urlToRemove) => {
    setUrls(urls.filter((url) => url !== urlToRemove));
  };
  const [showFeedManager, setshowFeedManager] = useState(true);
  function BasicList({ urls }) {
    return (
      <Box>
        <nav aria-label="main mailbox folders">
          <List>
            {urls.map((url) => (
              <ListItem
                key={url}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <ListItemText
                  primary={url}
                  style={{
                    overflow: "scroll",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                />
                <ListItemButton
                  onClick={() => handleRemove(url)}
                  style={{
                    color: "red",
                    background: "none",
                    cursor: "pointer",
                    width: "fit-content",
                    maxWidth: "fit-content",
                    padding: "5px",
                    borderRadius: "5px",
                    textAlign: "center",
                    minWidth: "30px",
                  }}
                >
                  <DeleteIcon />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </nav>
      </Box>
    );
  }

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState("");

  // 2. Function to trigger the server fetch
  async function loadFeeds() {
    setLoading(true);
    try {
      const data = await fetchFeeds(urls);
      setItems(data);
    } catch (error) {
      console.error("Failed to load feeds", error);
    }
    setLoading(false);
  }

  // Initial load and reload whenever 'urls' changes
  useEffect(() => {
    loadFeeds();
  }, [urls]);

  // Handler to add a new link via JS/UI
  const handleAdd = (e) => {
    e.preventDefault();
    if (newUrl && !urls.includes(newUrl)) {
      setUrls([...urls, newUrl]); // This triggers the useEffect
      setNewUrl("");
    }
  };

  return (
    <div style={{ margin: "1px", padding: "2.2rem", textWrap: "wrap" }}>
      <TabContext value={value}>
        <TabList
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            maxWidth: "100%",
            "& .MuiTabs-scroller": {
              overflowX: "auto !important",
              "&::-webkit-scrollbar": {
                display: "none",
              },
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            },
          }}
        >
          <Tab label="Focus Feeds" value="1" />
          <Tab label="Feeds Manager" value="2" />
          <Tab label="Settings" value="3" />
        </TabList>
        <TabPanel value="1">
          {/* --- Feed Display --- */}
          {loading
            ? <p>Loading feeds...</p>
            : <div>
                <h2 style={{ marginBottom: "1rem" }}>
                  Length - ({items.length} items)
                </h2>
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      marginBottom: "2rem",
                      borderBottom: "1px solid #eee",
                      paddingBottom: "1rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${new URL(item.link).hostname}&sz=32`}
                        alt="favicon"
                        onError={(e) => {
                          e.target.src = "/fallback-icon.png";
                        }} // Set a local fallback
                        style={{ width: 16, height: 16, borderRadius: "4px" }}
                      />
                      <span style={{ fontWeight: "bold" }}>{item.source}</span>
                    </div>
                    <h3 style={{ margin: "0.5rem 0" }}>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        style={{ textDecoration: "none", color: "#0070f3" }}
                      >
                        {item.title}
                      </a>
                    </h3>
                    <div style={{ color: "#666", fontSize: "0.85rem" }}>
                      {new Date(item.pubDate).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>}
        </TabPanel>
        <TabPanel value="2">
          <form onSubmit={handleAdd} style={{ display: "flex", gap: "0.5rem" }}>
            <Input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Enter RSS URL..."
              required
              style={{ flex: 1, padding: "0.5rem" }}
              autoComplete="off"
            />
            <Button type="submit" variant="contained">
              Add Feed
            </Button>
          </form>

          <BasicList urls={urls} />
        </TabPanel>
        <TabPanel value="3">Coming Soon</TabPanel>
      </TabContext>
    </div>
  );
}
