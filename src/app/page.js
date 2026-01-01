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
      <Box
        sx={{ width: "100%", maxWidth: "80vw", bgcolor: "background.paper" }}
      >
        <nav aria-label="main mailbox folders">
          <List>
            {urls.map((url) => (
              <ListItem key={url}>
                <ListItemText primary={url} />
                <ListItemButton
                  onClick={() => handleRemove(url)}
                  style={{
                    color: "red",
                    border: "red 1px solid",
                    background: "none",
                    cursor: "pointer",
                    width: "fit-content",
                    maxWidth: "fit-content",
                    padding: "5px",
                    borderRadius: "5px",
                  }}
                >
                  Remove
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
    <div style={{ maxWidth: "85vw", margin: "0 auto", padding: "2rem" }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <TabList onChange={handleChange}>
            <Tab label="Focus Feeds" value="1" />
            <Tab label="Feeds Manager" value="2" />
            <Tab label="Settings" value="3" />
          </TabList>
        </Box>
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
                    <span
                      style={{
                        padding: "0.2rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        display: "inline-block",
                        marginBottom: "0.5rem",
                        border: "1px solid #eee",
                      }}
                    >
                      {item.source}
                    </span>

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
