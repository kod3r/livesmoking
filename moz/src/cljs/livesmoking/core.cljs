(ns livesmoking.core
    (:require [reagent.core :as reagent]
              [re-frame.core :as re-frame]
              [livesmoking.events]
              [livesmoking.subs]
              [livesmoking.routes :as routes]
              [livesmoking.views :as views]
              [livesmoking.config :as config]))


(defn dev-setup []
  (when config/debug?
    (enable-console-print!)
    (println "dev mode")))

(defn mount-root []
  (reagent/render [views/main-panel]
                  (.getElementById js/document "app")))

(defn ^:export init []
  (routes/app-routes)
  (re-frame/dispatch-sync [:initialize-db])
  (dev-setup)
  (mount-root))
