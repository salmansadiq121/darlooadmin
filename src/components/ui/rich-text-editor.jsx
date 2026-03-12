"use client";
import { useState, useRef, useEffect } from "react";
import { Label } from "./label";
import { Button } from "./button";
import { cn } from "../../lib/utils";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  Type,
  Maximize2,
  Minimize2,
  RotateCcw,
  Copy,
  Image as ImageIcon,
  X,
  Upload,
  Link as LinkIcon,
  Loader2,
  Trash2,
} from "lucide-react";
import { uploadProductImage } from "@/app/utils/CommonFunction";
import toast from "react-hot-toast";

export function RichTextEditor({
  label,
  value,
  onChange,
  placeholder = "Start typing...",
  error,
  maxLength = 1000,
  className,
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageTab, setImageTab] = useState("url"); // "url" or "upload"
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  const isNearLimit = maxLength && charCount > maxLength * 0.8;
  const isOverLimit = maxLength && charCount > maxLength;

  // Initialize editor with value
  // useEffect(() => {
  //   if (editorRef.current && value && !editorRef.current.innerHTML) {
  //     editorRef.current.innerHTML = value
  //   }
  // }, [])
  // Sync editor content whenever `value` changes
  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || "";
      
      // Attach click handlers to existing images and ensure proper styling
      const images = editorRef.current.querySelectorAll("img");
      images.forEach((img) => {
        if (!img.classList.contains("editor-image")) {
          img.classList.add("editor-image");
          // Ensure image is visible and properly styled
          if (!img.style.maxWidth) img.style.maxWidth = "100%";
          if (!img.style.width) img.style.width = "auto";
          if (!img.style.height) img.style.height = "auto";
          if (!img.style.display) img.style.display = "block";
          if (!img.style.margin) img.style.margin = "10px auto";
          if (!img.style.borderRadius) img.style.borderRadius = "4px";
          if (!img.style.objectFit) img.style.objectFit = "contain";
          img.style.cursor = "pointer";
          img.style.position = "relative";
          
          // Ensure image loads
          if (!img.complete) {
            img.onload = () => {
              img.style.opacity = "1";
            };
            img.onerror = () => {
              console.error("Failed to load image:", img.src);
              img.style.display = "none";
            };
          }
          
          img.addEventListener("click", (e) => {
            e.stopPropagation();
            setSelectedImage(img);
            document.querySelectorAll(".editor-image").forEach((el) => {
              el.style.outline = "none";
              el.style.boxShadow = "none";
            });
            img.style.outline = "2px solid #ef4444";
            img.style.boxShadow = "0 0 0 4px rgba(239, 68, 68, 0.1)";
          });
        }
      });
    }
  }, [value]);

  // Update character and word count
  useEffect(() => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || "";
      setCharCount(text.length);
      setWordCount(text.trim() ? text.trim().split(/\\s+/).length : 0);
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const text = editorRef.current.innerText || "";

      // MaxLength enforcement is now handled by onBeforeInput and onPaste.
      // This ensures onChange is always called with content within limits.
      setCharCount(text.length);
      setWordCount(text.trim() ? text.trim().split(/\\s+/).length : 0);
      onChange(html);
    }
  };

  const handleBeforeInput = (event) => {
    if (maxLength && editorRef.current) {
      const currentText = editorRef.current.innerText || "";
      // Prevent input if adding new character would exceed maxLength
      if (event.data && currentText.length >= maxLength) {
        event.preventDefault();
      }
    }
  };

  const handlePaste = (event) => {
    event.preventDefault(); // Prevent default paste behavior

    if (editorRef.current) {
      const currentText = editorRef.current.innerText || "";
      let pastedText = event.clipboardData.getData("text/plain");

      if (maxLength) {
        const remainingChars = maxLength - currentText.length;
        if (remainingChars <= 0) {
          return; // No space left, do nothing
        }
        pastedText = pastedText.substring(0, remainingChars);
      }

      // Insert the (potentially truncated) plain text at the current cursor position
      document.execCommand("insertText", false, pastedText);
      handleInput(); // Update state and call onChange
    }
  };

  const execCommand = (command, value) => {
    document.execCommand(command, false, value);
    handleInput();
    editorRef.current?.focus();
  };

  const handleFormat = (format) => {
    execCommand(format);
  };

  const handleAlign = (alignment) => {
    execCommand("formatBlock", "<div>");
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const parentElement = range.commonAncestorContainer.parentElement;
    if (parentElement) {
      const currentBlock =
        parentElement.closest("div, p, h1, h2, h3, h4, h5, h6") ||
        parentElement;
      if (currentBlock) {
        currentBlock.style.textAlign = alignment;
      }
    }
    handleInput();
  };

  const handleList = (listType) => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return;
    // Focus the editor first
    editorRef.current.focus();
    // Check if we're already in a list
    const range = selection.getRangeAt(0);
    const listElement =
      range.commonAncestorContainer.parentElement?.closest("ul, ol");
    if (listElement) {
      // If already in a list, remove it
      const listItems = listElement.querySelectorAll("li");
      const fragment = document.createDocumentFragment();
      listItems.forEach((li) => {
        const div = document.createElement("div");
        div.innerHTML = li.innerHTML;
        fragment.appendChild(div);
      });
      listElement.parentNode?.replaceChild(fragment, listElement);
    } else {
      // Create new list
      if (listType === "insertUnorderedList") {
        document.execCommand("insertUnorderedList", false);
      } else if (listType === "insertOrderedList") {
        document.execCommand("insertOrderedList", false);
      }
    }
    handleInput();
  };

  const handleClear = () => {
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
      onChange("");
      editorRef.current.focus();
    }
  };

  const handleCopy = async () => {
    if (editorRef.current) {
      await navigator.clipboard.writeText(editorRef.current.innerText);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const insertImage = (url, alt = "") => {
    if (!editorRef.current) return;
    
    editorRef.current.focus();
    const selection = window.getSelection();
    const range = selection?.rangeCount > 0 ? selection.getRangeAt(0) : null;
    
    const img = document.createElement("img");
    img.src = url;
    img.alt = alt || "Image";
    img.style.maxWidth = "100%";
    img.style.width = "auto";
    img.style.height = "auto";
    img.style.display = "block";
    img.style.margin = "10px auto";
    img.style.borderRadius = "4px";
    img.style.cursor = "pointer";
    img.style.position = "relative";
    img.style.objectFit = "contain";
    img.style.opacity = "0";
    img.style.transition = "opacity 0.3s";
    img.className = "editor-image";
    
    // Handle image load
    img.onload = () => {
      // Image loaded successfully
      img.style.opacity = "1";
    };
    
    // Handle image error
    img.onerror = () => {
      console.error("Failed to load image:", url);
      toast.error("Failed to load image. Please check the URL.");
      // Show error placeholder instead of hiding
      img.style.opacity = "1";
      img.style.border = "2px dashed #ef4444";
      img.style.padding = "20px";
      img.style.backgroundColor = "#fee2e2";
      img.alt = "Failed to load image";
    };
    
    // Add click handler to select image
    img.addEventListener("click", (e) => {
      e.stopPropagation();
      setSelectedImage(img);
      // Add visual indicator
      document.querySelectorAll(".editor-image").forEach((el) => {
        el.style.outline = "none";
        el.style.boxShadow = "none";
      });
      img.style.outline = "2px solid #ef4444";
      img.style.boxShadow = "0 0 0 4px rgba(239, 68, 68, 0.1)";
    });
    
    // Create a container div for better structure
    const container = document.createElement("div");
    container.style.margin = "10px 0";
    container.style.position = "relative";
    container.style.display = "block";
    container.style.width = "100%";
    container.className = "image-container";
    container.appendChild(img);
    
    // Add a line break after the image for easier editing
    const br = document.createElement("br");
    container.appendChild(br);
    
    if (range) {
      range.deleteContents();
      range.insertNode(container);
    } else {
      editorRef.current.appendChild(container);
    }
    
    // Move cursor after image container
    const newRange = document.createRange();
    newRange.setStartAfter(container);
    newRange.collapse(true);
    selection?.removeAllRanges();
    selection?.addRange(newRange);
    
    handleInput();
  };

  const removeSelectedImage = () => {
    if (!selectedImage || !editorRef.current) return;
    
    // Find the container div
    const container = selectedImage.parentElement;
    if (container && container.classList.contains("image-container")) {
      container.remove();
    } else {
      selectedImage.remove();
    }
    
    setSelectedImage(null);
    handleInput();
    toast.success("Image removed");
  };

  const handleImageUrlSubmit = () => {
    if (!imageUrl.trim()) {
      toast.error("Please enter an image URL");
      return;
    }
    
    // Basic URL validation
    try {
      new URL(imageUrl);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }
    
    insertImage(imageUrl);
    setImageUrl("");
    setShowImageModal(false);
    toast.success("Image inserted successfully");
  };

  const handleImageUpload = async (event) => {
    event.stopPropagation();
    const file = event.target.files?.[0];
    if (!file) {
      // Reset file input if no file selected
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }
    
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size should be less than 10MB");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }
    
    try {
      setUploadingImage(true);
      const uploadedUrl = await uploadProductImage(file, setUploadingImage);
      
      if (uploadedUrl) {
        insertImage(uploadedUrl);
        setShowImageModal(false);
        setImageTab("url"); // Reset tab
        toast.success("Image uploaded and inserted successfully");
      } else {
        toast.error("Failed to upload image. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        {label ? (
          <Label
            htmlFor={label.toLowerCase().replace(/\\s+/g, "-")}
            className="text-sm font-medium text-gray-900 dark:text-gray-100"
          >
            {label}
          </Label>
        ) : (
          <span></span>
        )}
        <div className="flex items-center gap-1">
          {editorRef.current?.innerText && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-7 px-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-800"
              type="button"
            >
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleExpanded}
            className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            type="button"
          >
            {isExpanded ? (
              <Minimize2 className="h-3 w-3" />
            ) : (
              <Maximize2 className="h-3 w-3" />
            )}
          </Button>
        </div>
      </div>
      <div
        className={cn(
          "relative rounded-lg border-2 transition-all duration-200 border-gray-200 dark:border-gray-700 bg-white  dark:bg-slate-800",
          isFocused
            ? "border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/20"
            : error
            ? "border-red-300 dark:border-red-700"
            : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700",
          isExpanded && "fixed inset-4 z-50 h-auto"
        )}
      >
        {/* Formatting Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-t-lg">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFormat("bold")}
              className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
              type="button"
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFormat("italic")}
              className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
              type="button"
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFormat("underline")}
              className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
              type="button"
              title="Underline"
            >
              <Underline className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAlign("left")}
              className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
              type="button"
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAlign("center")}
              className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
              type="button"
              title="Align Center"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAlign("right")}
              className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
              type="button"
              title="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleList("insertUnorderedList")}
              className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
              type="button"
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleList("insertOrderedList")}
              className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
              type="button"
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
          </div>
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const url = prompt("Enter link URL:");
                if (url) execCommand("createLink", url);
              }}
              className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
              type="button"
              title="Insert Link"
            >
              <Link className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowImageModal(true)}
              className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
              type="button"
              title="Insert Image"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            {selectedImage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={removeSelectedImage}
                className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                type="button"
                title="Remove Selected Image"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => execCommand("formatBlock", "<h2>")}
              className="h-8 px-2 text-xs hover:bg-gray-200 dark:hover:bg-gray-700"
              type="button"
              title="Heading"
            >
              <Type className="h-3 w-3 mr-1" />
              Heading
            </Button>
          </div>
          <div className="ml-auto">
            {editorRef.current?.innerText && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-8 px-2 text-xs hover:bg-gray-200 dark:hover:bg-gray-700"
                type="button"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
        {/* Editor */}
        <div className="relative">
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              // Clear image selection when clicking outside
              setTimeout(() => {
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                  const range = selection.getRangeAt(0);
                  const node = range.commonAncestorContainer;
                  if (node.nodeType !== Node.ELEMENT_NODE || !node.closest("img")) {
                    setSelectedImage(null);
                    document.querySelectorAll(".editor-image").forEach((el) => {
                      el.style.outline = "none";
                      el.style.boxShadow = "none";
                    });
                  }
                } else {
                  setSelectedImage(null);
                  document.querySelectorAll(".editor-image").forEach((el) => {
                    el.style.outline = "none";
                    el.style.boxShadow = "none";
                  });
                }
              }, 100);
            }}
            onClick={(e) => {
              // Handle clicks on images
              const target = e.target;
              if (target.tagName === "IMG" && target.classList.contains("editor-image")) {
                setSelectedImage(target);
                document.querySelectorAll(".editor-image").forEach((el) => {
                  el.style.outline = "none";
                  el.style.boxShadow = "none";
                });
                target.style.outline = "2px solid #ef4444";
                target.style.boxShadow = "0 0 0 4px rgba(239, 68, 68, 0.1)";
              } else if (!target.closest("img")) {
                // Clear selection if clicking elsewhere
                setSelectedImage(null);
                document.querySelectorAll(".editor-image").forEach((el) => {
                  el.style.outline = "none";
                  el.style.boxShadow = "none";
                });
              }
            }}
            onBeforeInput={handleBeforeInput} // Add onBeforeInput for character limit
            onPaste={handlePaste} // Add onPaste for paste limit
            className={cn(
              "w-full min-h-[250px] px-4 py-3 text-sm dark:bg-slate-800  focus:outline-none overflow-auto prose prose-sm max-w-none",
              "[&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6",
              "[&_li]:mb-1 [&_li]:leading-relaxed",
              "[&_h1]:text-xl [&_h1]:font-bold [&_h1]:mb-2",
              "[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mb-2",
              "[&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-800",
              "[&_strong]:font-bold [&_em]:italic [&_u]:underline",
              "[&_img]:!max-w-full [&_img]:!w-auto [&_img]:!h-auto [&_img]:!block [&_img]:!my-2 [&_img]:!mx-auto [&_img]:!rounded-md [&_img]:!border [&_img]:!border-gray-200 [&_img]:!dark:border-gray-700 [&_img]:!transition-all [&_img]:!object-contain [&_img]:!opacity-100",
              "[&_.image-container]:!block [&_.image-container]:!w-full [&_.image-container]:!my-2 [&_.image-container]:!relative",
              "[&_img]:!visible",
              isExpanded ? "min-h-[calc(100vh-12rem)]" : "",
              "scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent"
            )}
            style={{
              maxHeight: isExpanded ? "calc(100vh - 12rem)" : "400px",
              lineHeight: "1.5",
            }}
            data-placeholder={placeholder}
            onKeyDown={(e) => {
              // Handle Delete/Backspace key when image is selected
              if ((e.key === "Delete" || e.key === "Backspace") && selectedImage) {
                e.preventDefault();
                removeSelectedImage();
                return;
              }
              // Handle Enter key in lists
              if (e.key === "Enter") {
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                  const range = selection.getRangeAt(0);
                  const listItem =
                    range.commonAncestorContainer.parentElement?.closest("li");
                  if (listItem && !listItem.textContent?.trim()) {
                    // If in empty list item, exit the list
                    e.preventDefault();
                    document.execCommand("outdent");
                    return;
                  }
                }
              }
              // Prevent default behavior for Tab key
              if (e.key === "Tab") {
                e.preventDefault();
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                  const range = selection.getRangeAt(0);
                  const listItem =
                    range.commonAncestorContainer.parentElement?.closest("li");
                  if (listItem) {
                    // In a list item, indent/outdent
                    if (e.shiftKey) {
                      document.execCommand("outdent");
                    } else {
                      document.execCommand("indent");
                    }
                  } else {
                    // Not in a list, insert spaces
                    document.execCommand(
                      "insertHTML",
                      false,
                      "&nbsp;&nbsp;&nbsp;&nbsp;"
                    );
                  }
                }
              }
            }}
          />
          {/* Placeholder */}
          {(!editorRef.current || !editorRef.current.innerText) && (
            <div className="absolute top-3 left-4 pointer-events-none">
              <div className="text-sm text-gray-400 dark:text-gray-500">
                {placeholder}
              </div>
            </div>
          )}
          {/* Writing indicator */}
          {isFocused && editorRef.current?.innerText && (
            <div className="absolute top-2 right-2">
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-950/50 rounded-full">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  Editing
                </span>
              </div>
            </div>
          )}
        </div>
        {/* Bottom bar with stats */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50/80 dark:bg-gray-900/80 border-t border-gray-100 dark:border-gray-800 backdrop-blur-sm rounded-b-lg">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium">{wordCount}</span>
              <span>words</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Progress bar */}
            {maxLength && (
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-300 rounded-full",
                      isOverLimit
                        ? "bg-red-500"
                        : isNearLimit
                        ? "bg-amber-500"
                        : "bg-green-500"
                    )}
                    style={{
                      width: `${Math.min((charCount / maxLength) * 100, 100)}%`,
                    }}
                  />
                </div>
                <div
                  className={cn(
                    "text-xs font-medium transition-colors tabular-nums",
                    isOverLimit
                      ? "text-red-500"
                      : isNearLimit
                      ? "text-amber-500"
                      : "text-gray-500 dark:text-gray-400"
                  )}
                >
                  {charCount}/{maxLength}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 animate-in slide-in-from-top-1 duration-200">
          <div className="w-1 h-1 bg-red-500 rounded-full"></div>
          {error}
        </div>
      )}
      {/* Helper Text */}
      {!error && (
        <p className="text-xs text-gray-500 dark:text-gray-400 transition-all duration-200">
          {isFocused
            ? "Use the toolbar to format your text. You can add bold, italic, lists, and more."
            : "Click to start editing..."}
        </p>
      )}
      {/* Expanded overlay */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={toggleExpanded}
        />
      )}
      
      {/* Image Insert Modal */}
      {showImageModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            // Close modal only if clicking the backdrop, not the modal content
            if (e.target === e.currentTarget) {
              setShowImageModal(false);
              setImageUrl("");
              setImageTab("url");
            }
          }}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Insert Image
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowImageModal(false);
                  setImageUrl("");
                  setImageTab("url");
                }}
                className="h-8 w-8 p-0"
                type="button"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setImageTab("url")}
                className={cn(
                  "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                  imageTab === "url"
                    ? "text-red-600 border-b-2 border-red-600 dark:text-red-400 dark:border-red-400"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Image URL
                </div>
              </button>
              <button
                type="button"
                onClick={() => setImageTab("upload")}
                className={cn(
                  "flex-1 px-4 py-3 text-sm font-medium transition-colors",
                  imageTab === "upload"
                    ? "text-red-600 border-b-2 border-red-600 dark:text-red-400 dark:border-red-400"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Image
                </div>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-4">
              {imageTab === "url" ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-gray-100"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleImageUrlSubmit();
                        }
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleImageUrlSubmit}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      type="button"
                    >
                      Insert Image
                    </Button>
                    <Button
                      onClick={() => {
                        setShowImageModal(false);
                        setImageUrl("");
                      }}
                      variant="outline"
                      className="flex-1"
                      type="button"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Upload Image
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {uploadingImage ? (
                          <>
                            <Loader2 className="h-8 w-8 text-red-600 animate-spin" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Uploading...
                            </span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Click to upload or drag and drop
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-500">
                              PNG, JPG, GIF up to 10MB
                            </span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setShowImageModal(false);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    variant="outline"
                    className="w-full"
                    type="button"
                    disabled={uploadingImage}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
