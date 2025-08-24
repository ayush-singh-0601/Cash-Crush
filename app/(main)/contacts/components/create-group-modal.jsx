"use client";

import React, { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Upload, Search, Plus, Image as ImageIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export function CreateGroupModal({ isOpen, onClose, onSuccess }) {
  const createGroup = useMutation(api.contacts.createGroup);
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Member management
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMemberSearch, setShowMemberSearch] = useState(false);
  
  const searchUsers = useQuery(api.users.searchUsers, { query: searchQuery });
  
  // Image upload
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const reset = () => {
    setName("");
    setDescription("");
    setImageUrl("");
    setError("");
    setSelectedMembers([]);
    setSearchQuery("");
    setShowMemberSearch(false);
    setImageFile(null);
    setImagePreview("");
    setUploadingImage(false);
  };

  const handleImageFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("Image file must be less than 5MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError("Please select a valid image file");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
      setImageUrl(""); // Clear URL input when file is selected
    }
  };

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'expense_app'); // You'll need to set this up in Cloudinary
    
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/your-cloud-name/image/upload`, // Replace with your cloud name
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      throw new Error('Failed to upload image');
    }
  };

  const addMember = (user) => {
    if (!selectedMembers.find(m => m.id === user.id)) {
      setSelectedMembers([...selectedMembers, user]);
    }
    setSearchQuery("");
    setShowMemberSearch(false);
  };

  const removeMember = (userId) => {
    setSelectedMembers(selectedMembers.filter(m => m.id !== userId));
  };

  const handleOpenChange = (open) => {
    if (!open) {
      reset();
      onClose?.();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Group name is required");
      return;
    }
    setLoading(true);
    setError("");
    
    try {
      let finalImageUrl = imageUrl.trim();
      
      // Upload image file if selected
      if (imageFile) {
        setUploadingImage(true);
        try {
          finalImageUrl = await uploadImageToCloudinary(imageFile);
        } catch (uploadError) {
          // Fallback to preview URL if upload fails
          finalImageUrl = imagePreview;
        }
        setUploadingImage(false);
      }
      
      const groupId = await createGroup({
        name: name.trim(),
        description: description.trim() || undefined,
        imageUrl: finalImageUrl || undefined,
        members: selectedMembers.map(m => m.id),
      });
      
      onSuccess?.(groupId);
      reset();
      onClose?.();
    } catch (err) {
      console.error(err);
      setError(err?.message || "Failed to create group");
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new group</DialogTitle>
          <DialogDescription>Give your group a name and optional description.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group name</Label>
            <Input
              id="group-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Goa Trip"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="group-desc">Description (optional)</Label>
            <Textarea
              id="group-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a short description about your group..."
              rows={3}
            />
          </div>
          
          {/* Enhanced Image Upload Section */}
          <div className="space-y-3">
            <Label>Group Image (optional)</Label>
            <div className="flex flex-col space-y-3">
              {/* Image Preview */}
              {(imagePreview || imageUrl) && (
                <div className="relative w-24 h-24 mx-auto">
                  <img
                    src={imagePreview || imageUrl}
                    alt="Group preview"
                    className="w-full h-full object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview("");
                      setImageUrl("");
                      setImageFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              
              {/* Upload Options */}
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading || uploadingImage}
                    className="flex items-center space-x-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Image</span>
                  </Button>
                  <span className="text-sm text-gray-500">or</span>
                </div>
                
                <Input
                  placeholder="Enter image URL (https://...)"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    if (e.target.value) {
                      setImageFile(null);
                      setImagePreview("");
                    }
                  }}
                  disabled={!!imageFile}
                />
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileSelect}
                  className="hidden"
                />
                
                <p className="text-xs text-gray-500">
                  Supported formats: JPG, PNG, GIF. Max size: 5MB
                </p>
              </div>
            </div>
          </div>
          
          {/* Members Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label> Add Members</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowMemberSearch(!showMemberSearch)}
                className="flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Members</span>
              </Button>
            </div>
            
            {/* Selected Members */}
            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedMembers.map((member) => (
                  <Badge key={member.id} variant="secondary" className="flex items-center space-x-2 py-1">
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={member.imageUrl} />
                      <AvatarFallback className="text-xs">
                        {member.name?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{member.name}</span>
                    <button
                      type="button"
                      onClick={() => removeMember(member.id)}
                      className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Member Search */}
            {showMemberSearch && (
              <div className="space-y-2 border rounded-lg p-3 bg-gray-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {searchUsers && searchUsers.length > 0 && (
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {searchUsers.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => addMember(user)}
                        className="flex items-center space-x-3 p-2 hover:bg-white rounded cursor-pointer"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.imageUrl} />
                          <AvatarFallback>
                            {user.name?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {searchQuery.length >= 2 && (!searchUsers || searchUsers.length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    No users found matching "{searchQuery}"
                  </p>
                )}
                
                {searchQuery.length < 2 && (
                  <p className="text-sm text-gray-500 text-center py-2">
                    Type at least 2 characters to search for users
                  </p>
                )}
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || uploadingImage}>
              {uploadingImage ? "Uploading Image..." : loading ? "Creating..." : "Create Group"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
