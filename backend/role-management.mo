import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";

module {
  public type SessionRoleState = {
    roles : Map.Map<Principal, AccessControl.UserRole>;
  };

  public func init() : SessionRoleState {
    {
      roles = Map.empty<Principal, AccessControl.UserRole>();
    };
  };

  public func setSessionRole(state : SessionRoleState, caller : Principal, role : AccessControl.UserRole) {
    state.roles.add(caller, role);
  };

  public func clearSessionRole(state : SessionRoleState, caller : Principal) {
    state.roles.remove(caller);
  };

  public func getSessionRole(state : SessionRoleState, caller : Principal) : ?AccessControl.UserRole {
    state.roles.get(caller);
  };
};
