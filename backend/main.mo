import Array "mo:core/Array";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  // Initialize user system state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // Tablature types
  type TablatureEntry = {
    note : Text;
    duration : Nat;
  };

  type Sequence = {
    name : Text;
    entries : [TablatureEntry];
  };

  module Sequence {
    public func compareByName(a : Sequence, b : Sequence) : Order.Order {
      Text.compare(a.name, b.name);
    };
  };

  let sequences = Map.empty<Text, Sequence>();

  // Fingering database
  type Fingering = {
    holes : [Bool]; // [topLeft, topRight, bottomLeft, bottomRight]
  };

  let initialFingeringsArray : [(Text, Fingering)] = [
    ("C", { holes = [false, false, false, false] }),
    ("D", { holes = [true, true, false, false] }),
    ("E", { holes = [true, true, true, true] }),
    ("F", { holes = [true, false, false, false] }),
    ("G", { holes = [false, true, false, false] }),
  ];
  let fingerings = Map.fromArray<Text, Fingering>(initialFingeringsArray);

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Query and Save Tablature Sequences
  public query func getAllSequences() : async [Sequence] {
    sequences.values().toArray().sort(Sequence.compareByName);
  };

  public shared ({ caller }) func saveSequence(sequence : Sequence) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save sequences");
    };
    sequences.add(sequence.name, sequence);
  };

  // Get/Set Fingering Config
  public query func getAllFingerings() : async [(Text, Fingering)] {
    fingerings.toArray();
  };

  public shared ({ caller }) func saveFingering(note : Text, fingering : Fingering) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can modify fingerings");
    };
    if (not isValidFingering(fingering)) {
      Runtime.trap("Invalid fingering: must have exactly 4 holes");
    };
    fingerings.add(note, fingering);
  };

  // Helper function to validate fingering input
  func isValidFingering(fingering : Fingering) : Bool {
    switch (fingering.holes.size()) {
      case (4) { true };
      case (_) { false };
    };
  };
};
